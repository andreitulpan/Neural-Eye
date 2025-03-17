using Microsoft.AspNetCore.Identity;

namespace NeuralEye.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Add any custom properties if needed, such as Full Name, etc.
        public string? FullName { get; set; }
    }

}
