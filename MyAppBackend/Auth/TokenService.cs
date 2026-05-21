using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MyAppBackend.Auth;

public class TokenService
{
    private readonly string secret;

    public TokenService(IConfiguration configuration)
    {
        secret = configuration["JwtSecret"]
            ?? throw new InvalidOperationException("JwtSecret is not configured.");
    }

    public string GenerateAccessToken(string userId, string role = "customer")
    {

        var key = new SymmetricSecurityKey(
            Encoding.ASCII.GetBytes(secret));

        var creds =
            new SigningCredentials(key,
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("id", userId),
            new Claim(ClaimTypes.Role, role)
        };

        var token =
            new JwtSecurityToken(
                claims: claims,
                expires:
                DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);

    }

    public string GenerateRefreshToken()
    {

        return Guid.NewGuid().ToString();

    }

}
