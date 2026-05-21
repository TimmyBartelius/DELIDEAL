using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MyAppBackend.Helpers
{
    public static class ClaimsHelper
    {
        public static string? GetUserId(ClaimsPrincipal user)
            => user.FindFirst("id")?.Value;

        public static string? GetRole(ClaimsPrincipal user)
            => user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("role")?.Value;

        public static bool IsAdmin(ClaimsPrincipal user)
            => GetRole(user) == "admin";

        public static bool IsMerchant(ClaimsPrincipal user)
            => GetRole(user) == "merchant";
    }
}
