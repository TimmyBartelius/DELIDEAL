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

        // GET api/admin/customers
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            var all = await _userService.GetAllUsersAsync();
            return Ok(all.Where(u => u.Role == "customer"));
        }

        // GET api/admin/merchants-users
        [HttpGet("merchants-users")]
        public async Task<IActionResult> GetMerchantUsers()
        {
            var all = await _userService.GetAllUsersAsync();
            return Ok(all.Where(u => u.Role == "merchant"));
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
    }

    public class UpdateUserDto
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
    }
}
