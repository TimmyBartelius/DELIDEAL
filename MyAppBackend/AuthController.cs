        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            await _refreshTokenService.DeleteAllTokensForUserAsync(userId);
            return Ok(new { message = "Utloggning lyckades." });
        }
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
        private readonly IUserProfileService _service;

        private readonly byte[] _key =
            Encoding.ASCII.GetBytes(
                "this-is-a-very-long-super-secret-key-1234567890!");

        // Lagrar refresh tokens (byt till DB i production)
        private static List<RefreshToken> _refreshTokens = new();


        private static MyAppBackend.RateLimiter _loginLimiter = new MyAppBackend.RateLimiter(5, TimeSpan.FromMinutes(1));
        private static MyAppBackend.RateLimiter _registerLimiter = new MyAppBackend.RateLimiter(3, TimeSpan.FromMinutes(5));

        public AuthController(IUserProfileService service, Google.Cloud.Firestore.FirestoreDb firestore)
        {
            _service = service;
            _firestore = firestore;
            _refreshTokenService = new Auth.RefreshTokenService(_firestore);
        }


        // =========================
        // LOGIN
        // =========================

        [HttpPost("login")]

        public async Task<IActionResult>
        Login([FromBody] LoginDto dto)
        {
            try
            {
                var user =
                await _service.ValidateUser(
                    dto.Email,
                    dto.Password);

                if (user == null)
                    return Unauthorized(
                        "Invalid credentials");


                var accessToken =
                GenerateJwtToken(user);


                var refreshToken =
                GenerateRefreshToken();


                _refreshTokens.Add(
                new RefreshToken
                {
                    Token = refreshToken,

                    UserId = user.Id,

                    private readonly Auth.RefreshTokenService _refreshTokenService;
                    private readonly Google.Cloud.Firestore.FirestoreDb _firestore;
                    DateTime.UtcNow.AddDays(7)
                });


                        _firestore = firestore;
                        _refreshTokenService = new Auth.RefreshTokenService(_firestore);
                return Ok(new
                {
                    token = accessToken,

                    refreshToken = refreshToken,

                    userId = user.Id,
                    public async Task<IActionResult> Login([FromBody] LoginDto dto)
                    {
                        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                        if (_loginLimiter.IsLimited(ip))
                            return StatusCode(429, "För många inloggningsförsök. Försök igen om en stund.");
                        try
                        {
                            var user = await _service.ValidateUser(dto.Email, dto.Password);
                            if (user == null)
                                return Unauthorized("Felaktig e-postadress eller lösenord.");

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
                _refreshTokens.Add(
                new RefreshToken
                {
                    Token = refreshToken,

                    UserId = user.Id,
                    public async Task<IActionResult> Register(RegisterDto dto)
                    {
                        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                        if (_registerLimiter.IsLimited(ip))
                            return StatusCode(429, "För många registreringsförsök. Försök igen om en stund.");

                        // Enkel e-postvalidering
                        if (string.IsNullOrWhiteSpace(dto.Email) || !System.Text.RegularExpressions.Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                            return BadRequest("Ogiltig e-postadress.");

                        // Enkel lösenordsvalidering: minst 8 tecken, minst en siffra och en bokstav
                        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8 ||
                            !System.Text.RegularExpressions.Regex.IsMatch(dto.Password, @"[A-Za-z]" ) ||
                            !System.Text.RegularExpressions.Regex.IsMatch(dto.Password, @"[0-9]" ))
                            return BadRequest("Lösenordet måste vara minst 8 tecken och innehålla både bokstäver och siffror.");

                        try
                        {
                            var user = await _service.RegisterUser(dto.UserName, dto.Email, dto.Password);
                            if (user == null)
                                return BadRequest("E-postadressen är redan registrerad. Har du glömt ditt lösenord?");

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

                return Unauthorized();



            if (storedToken.Expires <
                    public async Task<IActionResult> Refresh([FromBody] string refreshToken)
                    {
                        var storedToken = await _refreshTokenService.GetRefreshTokenAsync(refreshToken);
                        if (storedToken == null || storedToken.Expires < DateTime.UtcNow)
                            return Unauthorized();

                        var user = new UserProfile { Id = storedToken.UserId };
                        var newAccessToken = GenerateJwtToken(user);
                        return Ok(new { token = newAccessToken });
                    }
        // =========================
        // GENERATE JWT
        // =========================


        private string GenerateJwtToken(
            UserProfile user)
        {

            var tokenHandler =
                new JwtSecurityTokenHandler();


            var tokenDescriptor =
                new SecurityTokenDescriptor
                {

                    Subject =
                    new ClaimsIdentity(
                    new[]
                    {
                        new Claim(
                            "id",
                            user.Id)
                    }),


                    Expires =
                    DateTime.UtcNow
                    .AddHours(1),


                    SigningCredentials =
                    new SigningCredentials(

                        new SymmetricSecurityKey(
                            _key),

                        SecurityAlgorithms
                        .HmacSha256Signature)

                };


            var token =
            tokenHandler.CreateToken(
                tokenDescriptor);


            return tokenHandler
            .WriteToken(token);

        }



        // =========================
        // GENERATE REFRESH TOKEN
        // =========================


        private string GenerateRefreshToken()
        {

            return Guid
            .NewGuid()
            .ToString();

        }


    }



    // =========================
    // DTOs
    // =========================


    public class LoginDto
    {
        public string Email { get; set; } = "";

        public string Password { get; set; } = "";
    }


    public class RegisterDto
    {
        public string UserName { get; set; } = "";

        public string Email { get; set; } = "";

        public string Password { get; set; } = "";
    }


}
