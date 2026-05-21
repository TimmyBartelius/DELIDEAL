using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyAppBackend.Helpers;
using MyAppBackend.Models;
using MyAppBackend.Services;

namespace MyAppBackend.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserProfileService _userService;
        private readonly MerchantService _merchantService;

        public AdminController(IUserProfileService userService, MerchantService merchantService)
        {
            _userService = userService;
            _merchantService = merchantService;
        }

        // GET api/admin/all-users  – alla users oavsett roll
        [HttpGet("all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var userId = User.FindFirst("id")?.Value;
            Console.WriteLine($"[ADMIN] GetAllUsers anropat av userId={userId}");
            var all = await _userService.GetAllUsersAsync();
            Console.WriteLine($"[ADMIN] GetAllUsers: {all.Count} users totalt");
            // Returnera utan lösenordshash
            return Ok(all.Select(u => new { u.Id, u.UserName, u.Email, u.Role, u.AllowMarketing }));
        }

        // GET api/admin/customers
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            var userId = User.FindFirst("id")?.Value;
            Console.WriteLine($"[ADMIN] GetCustomers anropat av userId={userId}");
            var all = await _userService.GetAllUsersAsync();
            var customers = all.Where(u => u.Role == "customer").ToList();
            Console.WriteLine($"[ADMIN] GetCustomers: totalt {all.Count} users, {customers.Count} kunder");
            return Ok(customers);
        }

        // GET api/admin/merchants-users
        [HttpGet("merchants-users")]
        public async Task<IActionResult> GetMerchantUsers()
        {
            var userId = User.FindFirst("id")?.Value;
            Console.WriteLine($"[ADMIN] GetMerchantUsers anropat av userId={userId}");
            var all = await _userService.GetAllUsersAsync();
            var merchants = all.Where(u => u.Role == "merchant").ToList();
            Console.WriteLine($"[ADMIN] GetMerchantUsers: totalt {all.Count} users, {merchants.Count} merchants");
            return Ok(merchants);
        }

        // DELETE api/admin/users/{id}
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }

        // PUT api/admin/users/{id}
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var fields = new Dictionary<string, object>();
            if (dto.UserName != null) fields["UserName"] = dto.UserName;
            if (dto.Email != null) fields["Email"] = dto.Email;
            if (dto.Role != null) fields["Role"] = dto.Role;

            await _userService.UpdateUserAsync(id, fields);
            return NoContent();
        }

        // GET api/admin/merchants
        [HttpGet("merchants")]
        public async Task<IActionResult> GetMerchants()
        {
            return Ok(await _merchantService.GetAllAsync());
        }

        // POST api/admin/merchants
        [HttpPost("merchants")]
        public async Task<IActionResult> CreateMerchant([FromBody] Merchant merchant)
        {
            var created = await _merchantService.CreateAsync(merchant);
            return CreatedAtAction(nameof(GetMerchants), new { id = created.Id }, created);
        }

        // PUT api/admin/merchants/{id}
        [HttpPut("merchants/{id}")]
        public async Task<IActionResult> UpdateMerchant(string id, [FromBody] Dictionary<string, object> fields)
        {
            await _merchantService.UpdateAsync(id, fields);
            return NoContent();
        }

        // DELETE api/admin/merchants/{id}
        [HttpDelete("merchants/{id}")]
        public async Task<IActionResult> DeleteMerchant(string id)
        {
            await _merchantService.DeleteAsync(id);
            return NoContent();
        }

        // POST api/admin/create-merchant-account
        // Skapar användarkonto (roll=merchant) + butikspost atomärt
        [HttpPost("create-merchant-account")]
        public async Task<IActionResult> CreateMerchantAccount([FromBody] CreateMerchantAccountDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.UserName))
                return BadRequest("UserName, Email och Password är obligatoriska.");

            try
            {
                var user = await _userService.RegisterUser(dto.UserName, dto.Email, dto.Password, "merchant");
                if (user == null)
                    return BadRequest("E-postadressen är redan registrerad.");

                var merchant = new Merchant
                {
                    Name = dto.StoreName,
                    Address = dto.StoreAddress,
                    Phone = dto.StorePhone,
                    Email = dto.Email,
                    OwnerId = user.Id,
                    IsActive = true,
                    City = dto.StoreCity,
                    Latitude = dto.StoreLatitude,
                    Longitude = dto.StoreLongitude,
                };
                var createdMerchant = await _merchantService.CreateAsync(merchant);

                return Ok(new { user = new { user.Id, user.UserName, user.Email, user.Role }, merchant = createdMerchant });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CREATE-MERCHANT][ERROR] {ex}");
                return StatusCode(500, "Något gick fel vid skapandet av merchant-kontot: " + ex.Message);
            }
        }
    }

    public class UpdateUserDto
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
    }

    public class CreateMerchantAccountDto
    {
        public string UserName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string StoreName { get; set; } = "";
        public string StoreAddress { get; set; } = "";
        public string StorePhone { get; set; } = "";
        public string StoreCity { get; set; } = "";
        public double StoreLatitude { get; set; } = 57.7089;
        public double StoreLongitude { get; set; } = 11.9746;
    }
}
