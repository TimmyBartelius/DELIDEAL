using Google.Cloud.Firestore;

namespace MyAppBackend.Models
{
    [FirestoreData]
    public class Merchant
    {
        [FirestoreProperty]
        public string Id { get; set; } = "";

        [FirestoreProperty]
        public string Name { get; set; } = "";

        [FirestoreProperty]
        public string Email { get; set; } = "";

        [FirestoreProperty]
        public string Phone { get; set; } = "";

        [FirestoreProperty]
        public string Address { get; set; } = "";

        [FirestoreProperty]
        public string LogoBase64 { get; set; } = "";

        [FirestoreProperty]
        public string OwnerId { get; set; } = "";

        [FirestoreProperty]
        public bool IsActive { get; set; } = true;

        [FirestoreProperty]
        public string City { get; set; } = "";

        [FirestoreProperty]
        public double Latitude { get; set; } = 57.7089;

        [FirestoreProperty]
        public double Longitude { get; set; } = 11.9746;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
