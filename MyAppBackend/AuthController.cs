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


        public AuthController(IUserProfileService service)
        {
            _service = service;
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

                    Expires =
                    DateTime.UtcNow.AddDays(7)
                });


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
                return StatusCode(
                    500,
                    ex.Message);
            }
        }



        // =========================
        // REGISTER
        // =========================


        [HttpPost("register")]

        public async Task<IActionResult>
        Register(RegisterDto dto)
        {
            try
            {

                var user =
                await _service.RegisterUser(
                    dto.UserName,
                    dto.Email,
                    dto.Password);


                if (user == null)

                    return BadRequest(
                        "Email already exists!");



                var accessToken =
                GenerateJwtToken(user);


                var refreshToken =
                GenerateRefreshToken();


                _refreshTokens.Add(
                new RefreshToken
                {
                    Token = refreshToken,

                    UserId = user.Id,

                    Expires =
                    DateTime.UtcNow.AddDays(7)
                });



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
                return StatusCode(
                    500,
                    ex.Message);
            }

        }



        // =========================
        // REFRESH TOKEN
        // =========================


        [HttpPost("refresh")]

        public IActionResult Refresh(
            [FromBody] string refreshToken)
        {


            var storedToken =

            _refreshTokens
            .FirstOrDefault(
            x => x.Token == refreshToken);



            if (storedToken == null)

                return Unauthorized();



            if (storedToken.Expires <
                DateTime.UtcNow)

                return Unauthorized();



            var user = new UserProfile
            {
                Id = storedToken.UserId
            };



            var newAccessToken =
            GenerateJwtToken(user);



            return Ok(new
            {
                token = newAccessToken
            });

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
