using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Persistence.Seeding.Seeds;
using Autoria.shared.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Infrastructure.Persistence.Seeding
{
    public class DataSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<User> _userManager;
        private readonly AppDbContext _context;

        public DataSeeder(
            RoleManager<IdentityRole> roleManager,
            UserManager<User> userManager,
            AppDbContext context)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _context = context;
        }

        public async Task SeedAsync()
        {
            try
            {
                // 1. Seed Roles and Users first
                await new RoleSeeder(_roleManager).SeedAsync();
                await new UserSeeder(_userManager).SeedAsync();

                bool needsSave = false;

                // 2. Seed Lookups
                if (!await _context.ServiceTypes.AnyAsync())
                {
                    _context.ServiceTypes.AddRange(
                        new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Oil Change" },
                        new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Brakes" },
                        new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "AC Repair" },
                        new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Tires" }
                    );
                    needsSave = true;
                }

                if (!await _context.CarBrands.AnyAsync())
                {
                    _context.CarBrands.AddRange(
                        new CarBrand { Id = Guid.NewGuid(), Name = "Toyota" },
                        new CarBrand { Id = Guid.NewGuid(), Name = "Hyundai" },
                        new CarBrand { Id = Guid.NewGuid(), Name = "Kia" },
                        new CarBrand { Id = Guid.NewGuid(), Name = "Nissan" }
                    );
                    needsSave = true;
                }

                if (needsSave)
                {
                    await _context.SaveChangesAsync();
                }

                // 3. Seed Complex Features
                await new ServiceCenterSeeder(_context, _userManager).SeedAsync();
                await new SparePartSeeder(_context).SeedAsync();           // before Inventory
                await new SparePartImageSeeder(_context).SeedAsync();
                await new operatingHours_TimeSlotsSeeder(_context).SeedAsync();
                await new InventorySeeder(_context).SeedAsync();

            }
            catch (Exception ex)
            {
                // This will print out exactly what line failed and why in your IDE console
                Console.WriteLine("=================== SEEDER CRASH ERROR ===================");
                Console.WriteLine(ex.Message);
                if (ex.InnerException != null) Console.WriteLine($"Inner: {ex.InnerException.Message}");
                Console.WriteLine(ex.StackTrace);
                Console.WriteLine("==========================================================");
                throw; // rethrow so the app initialization catches it
            }
        }
    }
}