using Google.Cloud.Firestore;

namespace MyAppBackend.Models
{
    [FirestoreData]
    public class Product
    {
        [FirestoreProperty]
        public string Id { get; set; } = "";

        [FirestoreProperty]
        public string MerchantId { get; set; } = "";

        [FirestoreProperty]
        public string Name { get; set; } = "";

        [FirestoreProperty]
        public string Category { get; set; } = "";

        [FirestoreProperty]
        public string ImageBase64 { get; set; } = "";

        [FirestoreProperty]
        public double Price { get; set; }

        [FirestoreProperty]
        public string Unit { get; set; } = "kg";

        [FirestoreProperty]
        public double StockAmount { get; set; }

        [FirestoreProperty]
        public bool IsAvailable { get; set; } = true;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
