using Google.Cloud.Firestore;

namespace MyAppBackend.Auth;

[FirestoreData]
public class RefreshToken
{
    [FirestoreProperty]
    public required string Token { get; set; }

    [FirestoreProperty]
    public required string UserId { get; set; }

    [FirestoreProperty]
    public DateTime Expires { get; set; }
}
