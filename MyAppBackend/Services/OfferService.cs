using Google.Cloud.Firestore;
using MyAppBackend.Models;

namespace MyAppBackend.Services
{
    public class OfferService
    {
        private readonly FirestoreDb _firestore;

        public OfferService(FirestoreDb firestore)
        {
            _firestore = firestore;
        }

        public async Task<List<Offer>> GetByMerchantAsync(string merchantId)
        {
            var snapshot = await _firestore.Collection("offers").WhereEqualTo("MerchantId", merchantId).GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Offer>()).ToList();
        }

        public async Task<List<Offer>> GetActiveByMerchantAsync(string merchantId)
        {
            var now = DateTime.UtcNow;
            var all = await GetByMerchantAsync(merchantId);
            return all.Where(o => o.IsActive && o.StartsAt <= now && o.EndsAt >= now).ToList();
        }

        public async Task<List<Offer>> GetActiveByProductAsync(string productId)
        {
            var now = DateTime.UtcNow;
            var snapshot = await _firestore.Collection("offers").WhereEqualTo("ProductId", productId).GetSnapshotAsync();
            return snapshot.Documents
                .Select(d => d.ConvertTo<Offer>())
                .Where(o => o.IsActive && o.StartsAt <= now && o.EndsAt >= now)
                .ToList();
        }

        public async Task<Offer> CreateAsync(Offer offer, decimal standardPrice)
        {
            offer.Id = Guid.NewGuid().ToString();
            offer.OfferPrice = Math.Round(standardPrice * (1 - offer.DiscountPercent / 100), 2);
            await _firestore.Collection("offers").Document(offer.Id).SetAsync(offer);
            return offer;
        }

        public async Task UpdateAsync(string id, Dictionary<string, object> fields)
        {
            await _firestore.Collection("offers").Document(id).UpdateAsync(
                fields.ToDictionary(f => f.Key, f => f.Value));
        }

        public async Task DeleteAsync(string id)
        {
            await _firestore.Collection("offers").Document(id).DeleteAsync();
        }
    }
}
