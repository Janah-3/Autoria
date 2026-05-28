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
            
            await new RoleSeeder(_roleManager).SeedAsync();
            await new UserSeeder(_userManager).SeedAsync();

            
            if (!await _context.ServiceTypes.AnyAsync())
            {
                _context.ServiceTypes.AddRange(
                    new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Oil Change" },
                    new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Brakes" },
                    new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "AC Repair" },
                    new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Tires" },
                    new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Engine Diagnostics" },
                    new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Suspension" },
                    new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Electrical" },
                    new ServiceType { ServiceTypeId = Guid.NewGuid(), Name = "Body Work" }
                );
            }

            if (!await _context.CarBrands.AnyAsync())
            {
                _context.CarBrands.AddRange(
                    new CarBrand { Id = Guid.NewGuid(), Name = "Toyota" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "Hyundai" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "Kia" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "Nissan" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "Chevrolet" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "Suzuki" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "BMW" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "Mercedes" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "Honda" },
                    new CarBrand { Id = Guid.NewGuid(), Name = "Mitsubishi" }
                );
            }

           
            await _context.SaveChangesAsync();
        }
    }
}