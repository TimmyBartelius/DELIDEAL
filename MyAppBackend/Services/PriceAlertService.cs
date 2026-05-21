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
            alert.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
            await _firestore.Collection("priceAlerts").Document(alert.Id).SetAsync(alert);
            return alert;
        }

        public async Task DeleteAsync(string id)
        {
            await _firestore.Collection("priceAlerts").Document(id).DeleteAsync();
        }

        public async Task<List<PriceAlert>> GetUntriggeredForProductAsync(string productId, double currentPrice)
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

        /// <summary>
        /// Checks all untriggered alerts for a product at the given effective price,
        /// sends email notifications, and marks them as triggered.
        /// </summary>
        public async Task CheckAndTriggerAsync(
            string productId,
            double effectivePrice,
            string productName,
            string merchantName,
            IEmailService emailService,
            IUserProfileService userService)
        {
            var alerts = await GetUntriggeredForProductAsync(productId, effectivePrice);
            foreach (var alert in alerts)
            {
                var user = await userService.GetProfile(alert.UserId);
                if (user != null && !string.IsNullOrWhiteSpace(user.Email))
                {
                    try
                    {
                        await emailService.SendPriceAlertAsync(user.Email, productName, merchantName, alert.TargetPrice, effectivePrice);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[EMAIL ERROR] Failed to send alert to {user.Email}: {ex.Message}");
                    }
                }
                await MarkAsTriggeredAsync(alert.Id);
            }
        }
    }
}
