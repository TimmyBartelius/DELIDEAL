using Google.Cloud.Firestore;

namespace MyAppBackend.Models
{
    [FirestoreData]
    public class PriceAlert
    {
        [FirestoreProperty]
        public string Id { get; set; } = "";

        [FirestoreProperty]
        public string UserId { get; set; } = "";

        [FirestoreProperty]
        public string ProductId { get; set; } = "";

        [FirestoreProperty]
        public decimal TargetPrice { get; set; }

        // "email" eller "sms"
        [FirestoreProperty]
        public string NotifyVia { get; set; } = "email";

        [FirestoreProperty]
        public bool IsTriggered { get; set; } = false;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
