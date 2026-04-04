using Autoria.Infrastructure.Persistence.Seeding.Seeds;
using Microsoft.AspNetCore.Identity;

namespace Autoria.Infrastructure.Persistence.Seeding
{
    public class DataSeeder
    {
        private RoleManager<IdentityRole> _roleManager;

        public DataSeeder(RoleManager<IdentityRole> roleManager )
        {
            _roleManager = roleManager;
            
        }

        public async Task SeedAsync()
        {

            await new RoleSeeder(_roleManager).SeedAsync();
        }
    }
}
