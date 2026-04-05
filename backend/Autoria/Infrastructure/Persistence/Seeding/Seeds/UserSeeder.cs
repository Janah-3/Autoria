using System.Data;
using Autoria.features.user.entity;
using Autoria.shared.constants;
using Microsoft.AspNetCore.Identity;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class UserSeeder
    {
        private UserManager<User> _userManager;

        public UserSeeder(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

       public async Task SeedAsync()
        {
            try
            {
                if (!_userManager.Users.Any())
                {

                    //user
                    var user = new User { UserName = "jana", FullName = "Jana Ahmad", Email = "jana.ayoub.004@gmail.com", IsBanned = false, Created_At = DateTime.Now, PhoneNumber = "01060338557" };
                    await _userManager.CreateAsync(user, "Password@123");
                    await _userManager.AddToRoleAsync(user, Roles.User);

                    //admin
                    var admin = new User { UserName = "maram", FullName = "maram ihab", Email = "maram@gmail.com", IsBanned = false, Created_At = DateTime.Now, PhoneNumber = "01060338557" };
                    await _userManager.CreateAsync(admin, "Password@123");
                    await _userManager.AddToRoleAsync(admin, Roles.Admin);


                    //service center owner 
                    var ServiceCenterOwner = new User { UserName = "rana", FullName = "rana medhat", Email = "rana@gmail.com", IsBanned = false, Created_At = DateTime.Now, PhoneNumber = "01060338557" };
                    await _userManager.CreateAsync(ServiceCenterOwner, "Password@123");
                    await _userManager.AddToRoleAsync(ServiceCenterOwner, Roles.ServiceCenterOwner);


                }
            }catch (Exception ex)
            {
                throw new Exception($"user seeding failed: {ex}");
            }
        }
    }
}
