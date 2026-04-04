using Microsoft.AspNetCore.Identity;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class RoleSeeder
    {
        private RoleManager<IdentityRole> _roleManager;

        public RoleSeeder(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task SeedAsync()
        {
            var roles = new[] { "Admin", "User", "ServiceCenterOwner" };

            foreach(var role in roles)
            {
                if(!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
    }
}
