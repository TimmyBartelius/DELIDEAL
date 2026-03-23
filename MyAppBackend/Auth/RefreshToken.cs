namespace MyAppBackend.Auth;

public class RefreshToken
{
    public string Token { get; set; }
    public string UserId { get; set; }
    public DateTime Expires { get; set; }
}
