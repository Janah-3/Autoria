using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Persistence.Seeding.Seeds;
using Microsoft.AspNetCore.Identity;

namespace Autoria.Infrastructure.Persistence.Seeding
{
    public class DataSeeder
    {
        private RoleManager<IdentityRole> _roleManager;
        private UserManager<User> _userManager;

        public DataSeeder(RoleManager<IdentityRole> roleManager , UserManager<User> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            
        }

        public async Task SeedAsync()
        {

            await new RoleSeeder(_roleManager).SeedAsync();
            await new UserSeeder(_userManager).SeedAsync();
        }
    }
}
