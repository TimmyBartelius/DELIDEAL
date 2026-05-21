using Microsoft.AspNetCore.Mvc;
using MyAppBackend.Services;

namespace MyAppBackend.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _productService;
        private readonly OfferService _offerService;
        private readonly MerchantService _merchantService;

        public ProductController(ProductService productService, OfferService offerService, MerchantService merchantService)
        {
            _productService = productService;
            _offerService = offerService;
            _merchantService = merchantService;
        }

        // GET api/products
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _productService.GetAllAsync());
        }

        // GET api/products/search?q=räkor
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q)) return BadRequest("Search query is required.");
            return Ok(await _productService.SearchAsync(q));
        }

        // GET api/products/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null) return NotFound();

            var offers = await _offerService.GetActiveByProductAsync(id);
            return Ok(new { product, activeOffers = offers });
        }

        // GET api/products/merchant/{merchantId}
        [HttpGet("merchant/{merchantId}")]
        public async Task<IActionResult> GetByMerchant(string merchantId)
        {
            var products = await _productService.GetByMerchantAsync(merchantId);
            var result = new List<object>();

            foreach (var p in products)
            {
                var offers = await _offerService.GetActiveByProductAsync(p.Id);
                result.Add(new { product = p, activeOffers = offers });
            }

            return Ok(result);
        }

        // GET api/products/merchants
        [HttpGet("merchants")]
        public async Task<IActionResult> GetAllMerchants()
        {
            return Ok(await _merchantService.GetAllAsync());
        }

        // GET api/products/stores – alla aktiva butiker med produkter (för kundsidan, ingen auth)
        [HttpGet("stores")]
        public async Task<IActionResult> GetAllStores()
        {
            var merchants = (await _merchantService.GetAllAsync()).Where(m => m.IsActive).ToList();
            var result = new List<object>();

            foreach (var m in merchants)
            {
                var products = await _productService.GetByMerchantAsync(m.Id);
                var productList = new List<object>();

                foreach (var p in products.Where(p => p.IsAvailable))
                {
                    var offers = await _offerService.GetActiveByProductAsync(p.Id);
                    var bestOffer = offers.OrderByDescending(o => o.DiscountPercent).FirstOrDefault();
                    productList.Add(new
                    {
                        id = p.Id,
                        name = p.Name,
                        category = p.Category,
                        imageBase64 = p.ImageBase64,
                        price = p.Price,
                        unit = p.Unit,
                        stockAmount = p.StockAmount,
                        specialOffer = bestOffer != null,
                        offerPrice = bestOffer?.OfferPrice
                    });
                }

                result.Add(new
                {
                    id = m.Id,
                    name = m.Name,
                    city = m.City,
                    address = m.Address,
                    phone = m.Phone,
                    logoBase64 = m.LogoBase64,
                    latitude = m.Latitude,
                    longitude = m.Longitude,
                    products = productList
                });
            }

            return Ok(result);
        }
    }
}
