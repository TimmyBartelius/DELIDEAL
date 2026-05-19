using Google.Cloud.Firestore;

namespace MyAppBackend.Models
{
    [FirestoreData]
    public class Offer
    {
        [FirestoreProperty]
        public string Id { get; set; } = "";

        [FirestoreProperty]
        public string ProductId { get; set; } = "";

        [FirestoreProperty]
        public string MerchantId { get; set; } = "";

        // Rabattprocent, t.ex. 20 = 20% rabatt
        [FirestoreProperty]
        public decimal DiscountPercent { get; set; }

        // Beräknat pris under erbjudandet
        [FirestoreProperty]
        public decimal OfferPrice { get; set; }

        [FirestoreProperty]
        public DateTime StartsAt { get; set; }

        [FirestoreProperty]
        public DateTime EndsAt { get; set; }

        [FirestoreProperty]
        public bool IsActive { get; set; } = true;
    }
}
