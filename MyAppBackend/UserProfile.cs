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
    }
}
