using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MyAppBackend.Auth;

public class TokenService
{

    private readonly string secret =
        "this-is-a-very-long-super-secret-key-1234567890!";

    public string GenerateAccessToken(string userId)
    {

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secret));

        var creds =
            new SigningCredentials(key,
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("id", userId)
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
