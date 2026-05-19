using Google.Cloud.Firestore;
using System;
using System.Diagnostics.Contracts;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace MyAppBackend
{

[FirestoreData]
public class UserProfile
    {
        [FirestoreProperty]
        public string Id { get; set; } = "";
        [FirestoreProperty]
        public string UserName { get; set; } = "";
        [FirestoreProperty]
        public string Email { get; set; } = "";
        [FirestoreProperty]
        public string? Password { get; set; }
        [FirestoreProperty]
        public string Role { get; set; } = "customer";
        [FirestoreProperty]
        public bool AllowMarketing { get; set; } = false;
        [FirestoreProperty]
        public string? PasswordChangeToken { get; set; }
        [FirestoreProperty]
        public DateTime? PasswordChangeTokenExpires { get; set; }
    }
}
