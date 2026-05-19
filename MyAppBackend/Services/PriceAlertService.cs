using Google.Cloud.Firestore;
using MyAppBackend.Models;

namespace MyAppBackend.Services
{
    public class PriceAlertService
    {
        private readonly FirestoreDb _firestore;

        public PriceAlertService(FirestoreDb firestore)
        {
            _firestore = firestore;
        }

        public async Task<List<PriceAlert>> GetByUserAsync(string userId)
        {
            var snapshot = await _firestore.Collection("priceAlerts").WhereEqualTo("UserId", userId).GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<PriceAlert>()).ToList();
        }

        public async Task<PriceAlert> CreateAsync(PriceAlert alert)
        {
            alert.Id = Guid.NewGuid().ToString();
            alert.IsTriggered = false;
            alert.CreatedAt = DateTime.UtcNow;
            await _firestore.Collection("priceAlerts").Document(alert.Id).SetAsync(alert);
            return alert;
        }

        public async Task DeleteAsync(string id)
        {
            await _firestore.Collection("priceAlerts").Document(id).DeleteAsync();
        }

        // Körs för att kontrollera om ett pris nått en användares bevakningspris
        public async Task<List<PriceAlert>> GetUntriggeredForProductAsync(string productId, decimal currentPrice)
        {
            var snapshot = await _firestore.Collection("priceAlerts")
                .WhereEqualTo("ProductId", productId)
                .WhereEqualTo("IsTriggered", false)
                .GetSnapshotAsync();

            return snapshot.Documents
                .Select(d => d.ConvertTo<PriceAlert>())
                .Where(a => currentPrice <= a.TargetPrice)
                .ToList();
        }

        public async Task MarkAsTriggeredAsync(string id)
        {
            await _firestore.Collection("priceAlerts").Document(id).UpdateAsync(
                new Dictionary<string, object> { { "IsTriggered", true } });
        }
    }
}
