using System.Reflection.Metadata;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Runtime.InteropServices.Marshalling;
using System.Net;

namespace MyAppBackend.Controllers
{
    [ApiController]
    [Route("api/account")]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IUserProfileService _service;

        public AccountController(IUserProfileService service)
        {
            _service = service;
        }

        //GET api/account/my-profile
        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirst("id")?.Value;
            if (userId == null) return Unauthorized();

            var profile = await _service.GetProfile(userId);
            if (profile == null) return NotFound();

            return Ok(profile);
        }

        //GET api/account/profile-picture
        [HttpGet("profile-picture")]
        public async Task<IActionResult> GetProfilePicture()
        {
           var userId = User.FindFirst("id")?.Value;
           if (string.IsNullOrEmpty(userId)) return Unauthorized();

           var pic = await _service.GetProfilePicture(userId);

           if (string.IsNullOrEmpty(pic))
           pic = "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";

           return Ok(pic);

        }
        
        // PUT api/account/profile-picture
        [HttpPut("profile-picture")]
        public async Task<IActionResult> UpdateMyProfilePicture([FromBody] string base64Image)
        {
            var userId = User.FindFirst("id")?.Value;
            if (userId == null) return Unauthorized();

            if(string.IsNullOrEmpty(base64Image))
            return BadRequest("No image sent!");

            try
            {
                await _service.SaveProfilePicture(userId, base64Image);
                return NoContent();
            }
            catch(Exception ex)
            {
                return StatusCode(500, $"Failed to save profile picture: {ex.Message}");
            }

        }
    }
}
