using Google.Cloud.Firestore;
using MyAppBackend.Models;

namespace MyAppBackend.Services
{
    public class ProductService
    {
        private readonly FirestoreDb _firestore;

        public ProductService(FirestoreDb firestore)
        {
            _firestore = firestore;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            var snapshot = await _firestore.Collection("products").GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Product>()).ToList();
        }

        public async Task<List<Product>> GetByMerchantAsync(string merchantId)
        {
            var snapshot = await _firestore.Collection("products").WhereEqualTo("MerchantId", merchantId).GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Product>()).ToList();
        }

        public async Task<Product?> GetByIdAsync(string id)
        {
            var doc = await _firestore.Collection("products").Document(id).GetSnapshotAsync();
            return doc.Exists ? doc.ConvertTo<Product>() : null;
        }

        public async Task<List<Product>> SearchAsync(string query)
        {
            // Hämta alla och filtrera i minnet — byt till Algolia/Typesense för produktion
            var all = await GetAllAsync();
            return all.Where(p =>
                p.Name.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                p.Category.Contains(query, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        public async Task<Product> CreateAsync(Product product)
        {
            product.Id = Guid.NewGuid().ToString();
            product.CreatedAt = DateTime.UtcNow;
            await _firestore.Collection("products").Document(product.Id).SetAsync(product);
            return product;
        }

        public async Task UpdateAsync(string id, Dictionary<string, object> fields)
        {
            await _firestore.Collection("products").Document(id).UpdateAsync(
                fields.ToDictionary(f => f.Key, f => f.Value));
        }

        public async Task DeleteAsync(string id)
        {
            // Ta också bort eventuella erbjudanden på produkten
            var offers = await _firestore.Collection("offers").WhereEqualTo("ProductId", id).GetSnapshotAsync();
            foreach (var doc in offers.Documents)
                await doc.Reference.DeleteAsync();

            await _firestore.Collection("products").Document(id).DeleteAsync();
        }
    }
}
