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
        public string MerchantId { get; set; } = "";

        [FirestoreProperty]
        public string ProductName { get; set; } = "";

        [FirestoreProperty]
        public string MerchantName { get; set; } = "";

        [FirestoreProperty]
        public double TargetPrice { get; set; }

        [FirestoreProperty]
        public bool IsTriggered { get; set; } = false;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
    }
}
