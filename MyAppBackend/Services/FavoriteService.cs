using Google.Cloud.Firestore;
using MyAppBackend.Models;

namespace MyAppBackend.Services
{
    public class FavoriteService
    {
        private readonly FirestoreDb _firestore;

        public FavoriteService(FirestoreDb firestore)
        {
            _firestore = firestore;
        }

        public async Task<List<Favorite>> GetByUserAsync(string userId)
        {
            var snapshot = await _firestore.Collection("favorites").WhereEqualTo("UserId", userId).GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Favorite>()).ToList();
        }

        public async Task<Favorite> AddAsync(string userId, string type, string targetId)
        {
            // Kolla om den redan finns
            var existing = await _firestore.Collection("favorites")
                .WhereEqualTo("UserId", userId)
                .WhereEqualTo("TargetId", targetId)
                .GetSnapshotAsync();

            if (existing.Count > 0)
                return existing.Documents.First().ConvertTo<Favorite>();

            var favorite = new Favorite
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                Type = type,
                TargetId = targetId,
                CreatedAt = DateTime.UtcNow
            };
            await _firestore.Collection("favorites").Document(favorite.Id).SetAsync(favorite);
            return favorite;
        }

        public async Task RemoveAsync(string userId, string targetId)
        {
            var snapshot = await _firestore.Collection("favorites")
                .WhereEqualTo("UserId", userId)
                .WhereEqualTo("TargetId", targetId)
                .GetSnapshotAsync();

            foreach (var doc in snapshot.Documents)
                await doc.Reference.DeleteAsync();
        }
    }
}
