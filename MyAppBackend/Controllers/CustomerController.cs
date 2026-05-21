using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyAppBackend.Helpers;
using MyAppBackend.Models;
using MyAppBackend.Services;

namespace MyAppBackend.Controllers
{
    [ApiController]
    [Route("api/customer")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly IUserProfileService _userService;
        private readonly FavoriteService _favoriteService;
        private readonly PriceAlertService _priceAlertService;

        public CustomerController(IUserProfileService userService, FavoriteService favoriteService, PriceAlertService priceAlertService)
        {
            _userService = userService;
            _favoriteService = favoriteService;
            _priceAlertService = priceAlertService;
        }

        private string UserId => ClaimsHelper.GetUserId(User)!;

        // GET api/customer/favorites
        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavorites()
        {
            return Ok(await _favoriteService.GetByUserAsync(UserId));
        }

        // POST api/customer/favorites
        [HttpPost("favorites")]
        public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteDto dto)
        {
            if (dto.Type != "product" && dto.Type != "merchant")
                return BadRequest("Type must be 'product' or 'merchant'.");

            var favorite = await _favoriteService.AddAsync(UserId, dto.Type, dto.TargetId);
            return Ok(favorite);
        }

        // DELETE api/customer/favorites/{targetId}
        [HttpDelete("favorites/{targetId}")]
        public async Task<IActionResult> RemoveFavorite(string targetId)
        {
            await _favoriteService.RemoveAsync(UserId, targetId);
            return NoContent();
        }

        // GET api/customer/price-alerts
        [HttpGet("price-alerts")]
        public async Task<IActionResult> GetPriceAlerts()
        {
            return Ok(await _priceAlertService.GetByUserAsync(UserId));
        }

        // POST api/customer/price-alerts
        [HttpPost("price-alerts")]
        public async Task<IActionResult> CreatePriceAlert([FromBody] CreatePriceAlertDto dto)
        {
            var alert = new PriceAlert
            {
                UserId = UserId,
                ProductId = dto.ProductId,
                MerchantId = dto.MerchantId,
                ProductName = dto.ProductName,
                MerchantName = dto.MerchantName,
                TargetPrice = dto.TargetPrice
            };
            return Ok(await _priceAlertService.CreateAsync(alert));
        }

        // DELETE api/customer/price-alerts/{id}
        [HttpDelete("price-alerts/{id}")]
        public async Task<IActionResult> DeletePriceAlert(string id)
        {
            await _priceAlertService.DeleteAsync(id);
            return NoContent();
        }

        // PUT api/customer/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var fields = new Dictionary<string, object>();

            if (!string.IsNullOrWhiteSpace(dto.UserName))
            {
                var taken = await _userService.IsUserNameTakenAsync(dto.UserName, UserId);
                if (taken) return BadRequest("Användarnamnet är redan taget.");
                fields["UserName"] = dto.UserName;
            }

            if (!string.IsNullOrWhiteSpace(dto.AllowMarketing.ToString()))
                fields["AllowMarketing"] = dto.AllowMarketing;

            if (fields.Count == 0) return BadRequest("Inga fält att uppdatera.");

            await _userService.UpdateUserAsync(UserId, fields);
            return NoContent();
        }

        // POST api/customer/change-password/request
        [HttpPost("change-password/request")]
        public async Task<IActionResult> RequestPasswordChange()
        {
            var user = await _userService.GetProfile(UserId);
            if (user == null) return NotFound();

            // Generera en token och skicka till email/sms — stub för nu
            var token = Guid.NewGuid().ToString();
            await _userService.StorePasswordChangeTokenAsync(UserId, token);

            // TODO: Integrera e-posttjänst (t.ex. SendGrid) eller SMS (t.ex. Twilio)
            Console.WriteLine($"[PASSWORD CHANGE] Token för {user.Email}: {token}");

            return Ok(new { message = "En bekräftelse har skickats till din e-postadress." });
        }

        // POST api/customer/change-password/confirm
        [HttpPost("change-password/confirm")]
        public async Task<IActionResult> ConfirmPasswordChange([FromBody] ConfirmPasswordChangeDto dto)
        {
            var valid = await _userService.ValidatePasswordChangeTokenAsync(UserId, dto.Token);
            if (!valid) return BadRequest("Ogiltig eller utgången bekräftelsekod.");

            await _userService.ChangePasswordAsync(UserId, dto.NewPassword);
            return Ok(new { message = "Lösenordet har ändrats." });
        }
    }

    public class AddFavoriteDto
    {
        public string Type { get; set; } = "";
        public string TargetId { get; set; } = "";
    }

    public class CreatePriceAlertDto
    {
        public string ProductId { get; set; } = "";
        public string MerchantId { get; set; } = "";
        public string ProductName { get; set; } = "";
        public string MerchantName { get; set; } = "";
        public double TargetPrice { get; set; }
    }

    public class UpdateProfileDto
    {
        public string? UserName { get; set; }
        public bool AllowMarketing { get; set; }
    }

    public class ConfirmPasswordChangeDto
    {
        public string Token { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }
}
