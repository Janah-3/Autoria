using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.constants;
using Microsoft.AspNetCore.Identity;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class UserSeeder
    {
        private readonly UserManager<User> _userManager;

        public UserSeeder(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task SeedAsync()
        {
            try
            {
                // ================= USER =================
                if (await _userManager.FindByEmailAsync("nada@gmail.com") == null)
                {
                    var user = new User
                    {
                        UserName = "nada",
                        FullName = "Nada Hany",
                        Email = "nada@gmail.com",
                        IsBanned = false,
                        Created_At = DateTime.Now,
                        PhoneNumber = "01060338557",
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(user, "Password@123");

                    if (!result.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}"
                        );
                    }

                    var roleResult = await _userManager.AddToRoleAsync(user, Roles.User);

                    if (!roleResult.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to add role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}"
                        );
                    }
                }

                // ================= ADMIN =================
                if (await _userManager.FindByEmailAsync("maram2@gmail.com") == null)
                {
                    var admin = new User
                    {
                        UserName = "maram07",
                        FullName = "Maram Ihab",
                        Email = "maram2@gmail.com",
                        IsBanned = false,
                        Created_At = DateTime.Now,
                        PhoneNumber = "01060338557",
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(admin, "Password@123");

                    if (!result.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to create admin: {string.Join(", ", result.Errors.Select(e => e.Description))}"
                        );
                    }

                    var roleResult = await _userManager.AddToRoleAsync(admin, Roles.Admin);

                    if (!roleResult.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to add admin role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}"
                        );
                    }
                }

                // ================= SERVICE CENTER OWNER =================
                if (await _userManager.FindByEmailAsync("jana3@gmail.com") == null)
                {
                    var serviceCenterOwner = new User
                    {
                        UserName = "jana",
                        FullName = "Jana Ahmad",
                        Email = "jana3@gmail.com",
                        IsBanned = false,
                        Created_At = DateTime.Now,
                        PhoneNumber = "01060338557",
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(serviceCenterOwner, "Password@123");

                    if (!result.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to create service center owner: {string.Join(", ", result.Errors.Select(e => e.Description))}"
                        );
                    }

                    var roleResult = await _userManager.AddToRoleAsync(serviceCenterOwner, Roles.ServiceCenterOwner);

                    if (!roleResult.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to add service center owner role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"User seeding failed: {ex.Message}");
            }
        }
    }
}