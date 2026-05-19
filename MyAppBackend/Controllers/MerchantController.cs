using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyAppBackend.Helpers;
using MyAppBackend.Models;
using MyAppBackend.Services;

namespace MyAppBackend.Controllers
{
    [ApiController]
    [Route("api/merchant")]
    [Authorize(Roles = "merchant,admin")]
    public class MerchantController : ControllerBase
    {
        private readonly MerchantService _merchantService;
        private readonly ProductService _productService;
        private readonly OfferService _offerService;

        public MerchantController(MerchantService merchantService, ProductService productService, OfferService offerService)
        {
            _merchantService = merchantService;
            _productService = productService;
            _offerService = offerService;
        }

        private string? UserId => ClaimsHelper.GetUserId(User);

        private async Task<Merchant?> GetOwnMerchantAsync()
        {
            if (ClaimsHelper.IsAdmin(User)) return null;
            return await _merchantService.GetByOwnerIdAsync(UserId!);
        }

        private async Task<IActionResult?> AuthorizeMerchantAsync(string merchantId)
        {
            if (ClaimsHelper.IsAdmin(User)) return null;
            var merchant = await _merchantService.GetByOwnerIdAsync(UserId!);
            if (merchant == null || merchant.Id != merchantId)
                return Forbid();
            return null;
        }

        // GET api/merchant/my-store
        [HttpGet("my-store")]
        public async Task<IActionResult> GetMyStore()
        {
            var merchant = await _merchantService.GetByOwnerIdAsync(UserId!);
            if (merchant == null) return NotFound("No store found for this account.");
            return Ok(merchant);
        }

        // PUT api/merchant/my-store
        [HttpPut("my-store")]
        public async Task<IActionResult> UpdateMyStore([FromBody] Dictionary<string, object> fields)
        {
            var merchant = await _merchantService.GetByOwnerIdAsync(UserId!);
            if (merchant == null) return NotFound();
            await _merchantService.UpdateAsync(merchant.Id, fields);
            return NoContent();
        }

        // GET api/merchant/{merchantId}/products
        [HttpGet("{merchantId}/products")]
        public async Task<IActionResult> GetProducts(string merchantId)
        {
            var auth = await AuthorizeMerchantAsync(merchantId);
            if (auth != null) return auth;
            return Ok(await _productService.GetByMerchantAsync(merchantId));
        }

        // POST api/merchant/{merchantId}/products
        [HttpPost("{merchantId}/products")]
        public async Task<IActionResult> CreateProduct(string merchantId, [FromBody] Product product)
        {
            var auth = await AuthorizeMerchantAsync(merchantId);
            if (auth != null) return auth;
            product.MerchantId = merchantId;
            var created = await _productService.CreateAsync(product);
            return CreatedAtAction(nameof(GetProducts), new { merchantId }, created);
        }

        // PUT api/merchant/{merchantId}/products/{productId}
        [HttpPut("{merchantId}/products/{productId}")]
        public async Task<IActionResult> UpdateProduct(string merchantId, string productId, [FromBody] Dictionary<string, object> fields)
        {
            var auth = await AuthorizeMerchantAsync(merchantId);
            if (auth != null) return auth;
            await _productService.UpdateAsync(productId, fields);
            return NoContent();
        }

        // DELETE api/merchant/{merchantId}/products/{productId}
        [HttpDelete("{merchantId}/products/{productId}")]
        public async Task<IActionResult> DeleteProduct(string merchantId, string productId)
        {
            var auth = await AuthorizeMerchantAsync(merchantId);
            if (auth != null) return auth;
            await _productService.DeleteAsync(productId);
            return NoContent();
        }

        // GET api/merchant/{merchantId}/offers
        [HttpGet("{merchantId}/offers")]
        public async Task<IActionResult> GetOffers(string merchantId)
        {
            var auth = await AuthorizeMerchantAsync(merchantId);
            if (auth != null) return auth;
            return Ok(await _offerService.GetByMerchantAsync(merchantId));
        }

        // POST api/merchant/{merchantId}/offers
        [HttpPost("{merchantId}/offers")]
        public async Task<IActionResult> CreateOffer(string merchantId, [FromBody] CreateOfferDto dto)
        {
            var auth = await AuthorizeMerchantAsync(merchantId);
            if (auth != null) return auth;

            var product = await _productService.GetByIdAsync(dto.ProductId);
            if (product == null) return NotFound("Product not found.");

            var offer = new Offer
            {
                ProductId = dto.ProductId,
                MerchantId = merchantId,
                DiscountPercent = dto.DiscountPercent,
                StartsAt = dto.StartsAt,
                EndsAt = dto.EndsAt,
                IsActive = true
            };

            var created = await _offerService.CreateAsync(offer, product.Price);
            return CreatedAtAction(nameof(GetOffers), new { merchantId }, created);
        }

        // PUT api/merchant/{merchantId}/offers/{offerId}
        [HttpPut("{merchantId}/offers/{offerId}")]
        public async Task<IActionResult> UpdateOffer(string merchantId, string offerId, [FromBody] Dictionary<string, object> fields)
        {
            var auth = await AuthorizeMerchantAsync(merchantId);
            if (auth != null) return auth;
            await _offerService.UpdateAsync(offerId, fields);
            return NoContent();
        }

        // DELETE api/merchant/{merchantId}/offers/{offerId}
        [HttpDelete("{merchantId}/offers/{offerId}")]
        public async Task<IActionResult> DeleteOffer(string merchantId, string offerId)
        {
            var auth = await AuthorizeMerchantAsync(merchantId);
            if (auth != null) return auth;
            await _offerService.DeleteAsync(offerId);
            return NoContent();
        }
    }

    public class CreateOfferDto
    {
        public string ProductId { get; set; } = "";
        public double DiscountPercent { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
    }
}
