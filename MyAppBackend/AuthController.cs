using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MyAppBackend.Auth;

namespace MyAppBackend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        // Tillfälligt endpoint för att rensa alla användare
        [HttpPost("clear-users")]
        public async Task<IActionResult> ClearUsers()
        {
            await _service.DeleteAllUsers();
            return Ok("Alla användare raderade.");
        }
        private readonly IUserProfileService _service;
        private readonly Auth.RefreshTokenService _refreshTokenService;
        private readonly Google.Cloud.Firestore.FirestoreDb _firestore;

        private readonly byte[] _key =
            Encoding.ASCII.GetBytes(
                "this-is-a-very-long-super-secret-key-1234567890!");

        private static MyAppBackend.RateLimiter _loginLimiter = new MyAppBackend.RateLimiter(5, TimeSpan.FromMinutes(1));
        private static MyAppBackend.RateLimiter _registerLimiter = new MyAppBackend.RateLimiter(1000, TimeSpan.FromMinutes(5));

        public AuthController(IUserProfileService service, Google.Cloud.Firestore.FirestoreDb firestore)
        {
            _service = service;
            _firestore = firestore;
            _refreshTokenService = new Auth.RefreshTokenService(_firestore);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            if (_loginLimiter.IsLimited(ip))
                return StatusCode(429, "For many login attempts. Try again later.");
            try
            {
                var user = await _service.ValidateUser(dto.Email, dto.Password);
                if (user == null)
                    return Unauthorized("Invalid email or password.");

                var accessToken = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                var refreshTokenObj = new RefreshToken
                {
                    Token = refreshToken,
                    UserId = user.Id,
                    Expires = DateTime.UtcNow.AddDays(7)
                };
                await _refreshTokenService.StoreRefreshTokenAsync(refreshTokenObj);

                return Ok(new
                {
                    token = accessToken,
                    refreshToken = refreshToken,
                    userId = user.Id,
                    userName = user.UserName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            Console.WriteLine($"[REGISTER] IP: {ip}, UserName: {dto.UserName}, Email: {dto.Email}, Role: {dto.Role}");
            if (_registerLimiter.IsLimited(ip))
            {
                Console.WriteLine("[REGISTER] Rate limited for IP: " + ip);
                return StatusCode(429, "Too many registration attempts. Try again later.");
            }

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                Console.WriteLine("[REGISTER] Saknar e-postadress");
                return BadRequest("Du måste ange en e-postadress.");
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                Console.WriteLine($"[REGISTER] Ogiltig e-postadress: {dto.Email}");
                return BadRequest("E-postadressen är ogiltig. Exempel: namn@gmail.com");
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                Console.WriteLine("[REGISTER] Saknar lösenord");
                return BadRequest("Du måste ange ett lösenord.");
            }
            if (dto.Password.Length < 8)
            {
                Console.WriteLine($"[REGISTER] För kort lösenord: {dto.Password}");
                return BadRequest("Lösenordet måste vara minst 8 tecken långt.");
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Password, @"[A-Za-z]"))
            {
                Console.WriteLine($"[REGISTER] Lösenord saknar bokstav: {dto.Password}");
                return BadRequest("Lösenordet måste innehålla minst en bokstav.");
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Password, @"[0-9]"))
            {
                Console.WriteLine($"[REGISTER] Lösenord saknar siffra: {dto.Password}");
                return BadRequest("Lösenordet måste innehålla minst en siffra.");
            }

            try
            {
                var user = await _service.RegisterUser(dto.UserName, dto.Email, dto.Password, dto.Role ?? "customer");
                if (user == null)
                {
                    Console.WriteLine($"[REGISTER] Email redan registrerad: {dto.Email}");
                    return BadRequest("Email is already registered.");
                }

                var accessToken = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                var refreshTokenObj = new RefreshToken
                {
                    Token = refreshToken,
                    UserId = user.Id,
                    Expires = DateTime.UtcNow.AddDays(7)
                };
                await _refreshTokenService.StoreRefreshTokenAsync(refreshTokenObj);

                Console.WriteLine($"[REGISTER] User skapad: {user.Email} ({user.Role})");
                return Ok(new
                {
                    token = accessToken,
                    refreshToken = refreshToken,
                    userId = user.Id,
                    userName = user.UserName,
                    role = user.Role
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REGISTER][ERROR] {ex}");
                return StatusCode(500, ex.ToString());
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            var storedToken = await _refreshTokenService.GetRefreshTokenAsync(refreshToken);
            if (storedToken == null || storedToken.Expires < DateTime.UtcNow)
                return Unauthorized();

            var user = new UserProfile { Id = storedToken.UserId };
            var newAccessToken = GenerateJwtToken(user);
            return Ok(new { token = newAccessToken });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            await _refreshTokenService.DeleteAllTokensForUserAsync(userId);
            return Ok(new { message = "Logout successful." });
        }

        private string GenerateJwtToken(UserProfile user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(_key),
                    SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }
    }

    public class LoginDto
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    // RegisterDto ska endast finnas i RegisterDto.cs
}
