using Google.Cloud.Firestore;

namespace MyAppBackend.Models
{
    [FirestoreData]
    public class Favorite
    {
        [FirestoreProperty]
        public string Id { get; set; } = "";

        [FirestoreProperty]
        public string UserId { get; set; } = "";

        // "product" eller "merchant"
        [FirestoreProperty]
        public string Type { get; set; } = "";

        [FirestoreProperty]
        public string TargetId { get; set; } = "";

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
