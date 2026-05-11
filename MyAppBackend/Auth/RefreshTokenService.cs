using Google.Cloud.Firestore;
using System;
using System.Threading.Tasks;

namespace MyAppBackend.Auth
{
    public class RefreshTokenService
    {
        private readonly FirestoreDb _firestore;
        public RefreshTokenService(FirestoreDb firestore)
        {
            _firestore = firestore;
        }

        public async Task StoreRefreshTokenAsync(RefreshToken token)
        {
            var tokensRef = _firestore.Collection("refreshTokens");
            await tokensRef.Document(token.Token).SetAsync(token);
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            var doc = await _firestore.Collection("refreshTokens").Document(token).GetSnapshotAsync();
            if (!doc.Exists) return null;
            return doc.ConvertTo<RefreshToken>();
        }

        public async Task DeleteRefreshTokenAsync(string token)
        {
            await _firestore.Collection("refreshTokens").Document(token).DeleteAsync();
        }

        public async Task DeleteAllTokensForUserAsync(string userId)
        {
            var tokensRef = _firestore.Collection("refreshTokens");
            var snapshot = await tokensRef.WhereEqualTo("UserId", userId).GetSnapshotAsync();
            foreach (var doc in snapshot.Documents)
            {
                await doc.Reference.DeleteAsync();
            }
        }
    }
}
