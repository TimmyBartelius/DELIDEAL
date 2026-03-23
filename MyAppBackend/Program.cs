using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MyAppBackend;
using MyAppBackend.Auth;
using System;
using Microsoft.VisualBasic;
using System.Net.Security;

var builder = WebApplication.CreateBuilder(args);

// ===== CORS för Angular frontend =====
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ===== Lägg till controllers =====
builder.Services.AddControllers();

// ===== Lägg till vår "databas"/tjänster =====
builder.Services.AddSingleton<IUserProfileService, UserProfileService>();

// ===== JWT-konfiguration =====
var key = Encoding.ASCII.GetBytes("this-is-a-very-long-super-secret-key-1234567890!"); 
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

var app = builder.Build();

// ===== Middleware =====
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
