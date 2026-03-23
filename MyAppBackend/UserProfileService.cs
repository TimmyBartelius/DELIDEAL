using System;
using System.Threading.Tasks;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using BCrypt.Net;
using System.Text;
using System.Linq.Expressions;

namespace MyAppBackend
{
    public interface IUserProfileService
    {
        Task<UserProfile?> GetProfile(string userId);
        Task<string?> GetProfilePicture(string userId);
        Task<UserProfile?> ValidateUser(string email, string password);
        Task<UserProfile?> RegisterUser(string username, string email, string password);
        Task SaveProfilePicture(string userId, string base64Image);
    }

    public class UserProfileService : IUserProfileService
    {
        public const string DefaultProfilePictureBase64 = "iVBORw0KGgoAAAANSUhEUgAAAF4AAABeCAYAAACq0qNuAAA...";
        private readonly FirestoreDb? _firestore;

        public UserProfileService()
        {
            try
            {
                if (FirebaseApp.DefaultInstance == null)
                {
                    var credentialPath = "Firebase/firebase-key.json";
                    if (!System.IO.File.Exists(credentialPath))
                        throw new Exception($"Firebase credential not found at {credentialPath}");

                    var credential = GoogleCredential.FromFile(credentialPath);
                    FirebaseApp.Create(new AppOptions
                    {
                        Credential = credential
                    });
                }

                _firestore = FirestoreDb.Create("examensarbete-3cda1");
            }
            catch (Exception ex)
            {
                // Logga felet, sätt _firestore = null så vi kan checka senare
                Console.WriteLine("Failed to initialize Firestore: " + ex.Message);
                _firestore = null;
            }
        }

        private void EnsureFirestore()
        {
            if (_firestore == null)
                throw new Exception("Firestore is not initialized. Check firebase-key.json and project ID.");
        }

        public async Task<UserProfile?> GetProfile(string userId)
        {
            EnsureFirestore();

            var docRef = _firestore!.Collection("users").Document(userId);
            var snapshot = await docRef.GetSnapshotAsync();
            if (!snapshot.Exists) return null;
            return snapshot.ConvertTo<UserProfile>();
        }

        public async Task<string?> GetProfilePicture(string userId)
        {
            EnsureFirestore();

            var docRef = _firestore!.Collection("profilePictures").Document(userId);
            var snapshot = await docRef.GetSnapshotAsync();
            if (!snapshot.Exists) return DefaultProfilePictureBase64;
            return snapshot.GetValue<string>("base64Image");
        }

        public async Task<UserProfile?> ValidateUser(string email, string password)
        {
            EnsureFirestore();

            var usersRef = _firestore!.Collection("users");
            var snapshot = await usersRef.WhereEqualTo("Email", email).GetSnapshotAsync();

            foreach (var doc in snapshot.Documents)
            {
                var user = doc.ConvertTo<UserProfile>();
                if (user.Password != null && BCrypt.Net.BCrypt.Verify(password, user.Password))
                {
                    user.Password = null;
                    return user;
                }
            }

            return null;
        }

        public async Task<UserProfile?> RegisterUser(string username, string email, string password)
        {
            EnsureFirestore();

            try
            {
                var usersRef = _firestore!.Collection("users");
                var existing = await usersRef.WhereEqualTo("Email", email).GetSnapshotAsync();
                if (existing.Count > 0) return null;

                var newUser = new UserProfile
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = username,
                    Email = email,
                    Password = BCrypt.Net.BCrypt.HashPassword(password)
                };

                await usersRef.Document(newUser.Id).SetAsync(newUser);

                newUser.Password = null; 
                return newUser;
            }
            catch (Exception ex)
            {
                // Logga för felsökning
                Console.WriteLine("Failed to register user: " + ex);
                throw; 
            }
        }

        public async Task SaveProfilePicture(string userId, string base64Image)
        {
            EnsureFirestore();
            Console.WriteLine($"Saving profile picture for user {userId}, length {base64Image.Length}");

            if(string.IsNullOrWhiteSpace(base64Image))
            throw new Exception("No image provided!");

            //Strip data:image/...precfix
            var commaIndex = base64Image.IndexOf(",");
            if (commaIndex >= 0)
            base64Image = base64Image.Substring(commaIndex + 1);

            if(Encoding.UTF8.GetByteCount(base64Image) > 900_000)
            throw new Exception("Image too large for Firestore!");

            var picturesRef = _firestore!.Collection("profilePictures");
            await picturesRef.Document(userId).SetAsync(new { base64Image });
        }
    }
}
