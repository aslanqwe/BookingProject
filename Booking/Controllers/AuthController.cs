using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Booking.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;

    public AuthController(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        var user = new IdentityUser { UserName = model.Email, Email = model.Email };
        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            // Назначаем роль (User, Owner или Admin)
            await _userManager.AddToRoleAsync(user, model.Role);
            return Ok(new { message = "User registered successfully!" });
        }

        return BadRequest(result.Errors);
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password)) return Unauthorized();
        var roles = await _userManager.GetRolesAsync(user);
        // Пока возвращаем просто роль и почту, позже добавим полноценный токен
        return Ok(new { 
            email = user.Email, 
            role = roles.FirstOrDefault() 
        });
    }
    
}

public class LoginModel {
    public string Email { get; set; }
    public string Password { get; set; }
}

public class RegisterModel
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Role { get; set; } // "User" или "Owner"
}