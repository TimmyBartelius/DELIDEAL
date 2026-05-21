using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MyAppBackend;
using MyAppBackend.Auth;
using MyAppBackend.Services;
using System;

var builder = WebApplication.CreateBuilder(args);

// ===== CORS för Angular frontend =====
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = (builder.Configuration["AllowedOrigins"] ?? "http://localhost:4200")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ===== Lägg till controllers =====
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Returnera camelCase JSON (id, userName, role) så att Angular-frontend matchar
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ===== Firebase / Firestore =====
Google.Cloud.Firestore.FirestoreDb firestoreDb;
try
{
    // Sökordning: Render Secret File → miljövariabel → lokal fil
    var secretFilePath = "/etc/secrets/firebase-key.json";
    string credentialPath;

    if (File.Exists(secretFilePath))
    {
        // Render Secret File (rekommenderat i produktion)
        credentialPath = secretFilePath;
    }
    else
    {
        var credentialsJson = Environment.GetEnvironmentVariable("GOOGLE_CREDENTIALS_JSON");
        if (!string.IsNullOrEmpty(credentialsJson))
        {
            credentialPath = Path.Combine(Path.GetTempPath(), "firebase-key.json");
            File.WriteAllText(credentialPath, credentialsJson);
        }
        else
        {
            // Lokal utveckling
            credentialPath = Path.GetFullPath("Firebase/firebase-key.json");
            if (!File.Exists(credentialPath))
                throw new Exception($"Firebase credential not found at {credentialPath}");
        }
    }

    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialPath);

    if (FirebaseAdmin.FirebaseApp.DefaultInstance == null)
    {
#pragma warning disable CS0618
        var credential = Google.Apis.Auth.OAuth2.GoogleCredential.FromFile(credentialPath);
#pragma warning restore CS0618
        FirebaseAdmin.FirebaseApp.Create(new FirebaseAdmin.AppOptions { Credential = credential });
    }
    firestoreDb = Google.Cloud.Firestore.FirestoreDb.Create("examensarbete-3cda1");
}
catch (Exception ex)
{
    Console.WriteLine("Failed to initialize Firestore: " + ex.Message);
    throw;
}
builder.Services.AddSingleton(firestoreDb);

// ===== Lägg till vår "databas"/tjänster =====
builder.Services.AddSingleton<IUserProfileService, UserProfileService>();
builder.Services.AddSingleton<MerchantService>();
builder.Services.AddSingleton<ProductService>();
builder.Services.AddSingleton<OfferService>();
builder.Services.AddSingleton<FavoriteService>();
builder.Services.AddSingleton<PriceAlertService>();
builder.Services.AddSingleton<IEmailService, EmailService>();

// ===== JWT-konfiguration =====
var jwtSecret = builder.Configuration["JwtSecret"];
if (string.IsNullOrEmpty(jwtSecret))
    throw new InvalidOperationException("JwtSecret is not configured. Set it in appsettings or as an environment variable.");
var key = Encoding.ASCII.GetBytes(jwtSecret);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddSingleton<TokenService>();

builder.Services.AddAuthorization();

// Render sätter PORT-miljövariabeln automatiskt för web services
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

// ===== Middleware =====
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
