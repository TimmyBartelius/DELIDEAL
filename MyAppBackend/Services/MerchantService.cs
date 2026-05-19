using Google.Cloud.Firestore;
using MyAppBackend.Models;

namespace MyAppBackend.Services
{
    public class MerchantService
    {
        private readonly FirestoreDb _firestore;

        public MerchantService(FirestoreDb firestore)
        {
            _firestore = firestore;
        }

        public async Task<List<Merchant>> GetAllAsync()
        {
            var snapshot = await _firestore.Collection("merchants").GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Merchant>()).ToList();
        }

        public async Task<Merchant?> GetByIdAsync(string id)
        {
            var doc = await _firestore.Collection("merchants").Document(id).GetSnapshotAsync();
            return doc.Exists ? doc.ConvertTo<Merchant>() : null;
        }

        public async Task<Merchant?> GetByOwnerIdAsync(string ownerId)
        {
            var snapshot = await _firestore.Collection("merchants").WhereEqualTo("OwnerId", ownerId).GetSnapshotAsync();
            return snapshot.Documents.FirstOrDefault()?.ConvertTo<Merchant>();
        }

        public async Task<Merchant> CreateAsync(Merchant merchant)
        {
            merchant.Id = Guid.NewGuid().ToString();
            merchant.CreatedAt = DateTime.UtcNow;
            await _firestore.Collection("merchants").Document(merchant.Id).SetAsync(merchant);
            return merchant;
        }

        public async Task UpdateAsync(string id, Dictionary<string, object> fields)
        {
            var updates = fields.ToDictionary(f => f.Key, f => UnwrapJsonElement(f.Value));
            await _firestore.Collection("merchants").Document(id).UpdateAsync(updates);
        }

        private static object UnwrapJsonElement(object value)
        {
            if (value is System.Text.Json.JsonElement el)
            {
                return el.ValueKind switch
                {
                    System.Text.Json.JsonValueKind.String => el.GetString() ?? "",
                    System.Text.Json.JsonValueKind.Number => el.TryGetInt64(out var l) ? (object)l : el.GetDouble(),
                    System.Text.Json.JsonValueKind.True => (object)true,
                    System.Text.Json.JsonValueKind.False => (object)false,
                    _ => el.ToString()
                };
            }
            return value;
        }

        public async Task DeleteAsync(string id)
        {
            // Ta också bort alla produkter och erbjudanden kopplade till handlaren
            var products = await _firestore.Collection("products").WhereEqualTo("MerchantId", id).GetSnapshotAsync();
            foreach (var doc in products.Documents)
                await doc.Reference.DeleteAsync();

            var offers = await _firestore.Collection("offers").WhereEqualTo("MerchantId", id).GetSnapshotAsync();
            foreach (var doc in offers.Documents)
                await doc.Reference.DeleteAsync();

            await _firestore.Collection("merchants").Document(id).DeleteAsync();
        }
    }
}
