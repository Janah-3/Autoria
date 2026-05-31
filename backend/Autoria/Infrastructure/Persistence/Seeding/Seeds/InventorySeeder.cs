
    using global::Autoria.features.Inventory.Entities;
    using Microsoft.EntityFrameworkCore;

    namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
    {
        public class InventorySeeder
        {
            private readonly AppDbContext _context;
            private static readonly Guid ServiceCenterId = Guid.Parse("BB22CC33-44DD-55EE-66FF-77AA88BB99CC");

            public InventorySeeder(AppDbContext context)
            {
                _context = context;
            }

            public async Task SeedAsync()
            {
                if (await _context.Inventories.AnyAsync(i => i.ServiceCenterId == ServiceCenterId))
                    return;

                var inventories = new List<Inventory>
            {
                new Inventory
                {
                    Id              = Guid.NewGuid(),
                    ServiceCenterId = ServiceCenterId,
                    SparePartId     = Guid.Parse("11111111-1111-1111-1111-111111111002"), // Brake Pads
                    Quantity        = 20,
                    IsAvailable     = true,
                    Price           = 450.00m,
                    LowStockThreshold = 5,
                    IsFlaggedLowStock = false,
                    UpdatedAt       = DateTime.UtcNow
                },
                new Inventory
                {
                    Id              = Guid.NewGuid(),
                    ServiceCenterId = ServiceCenterId,
                    SparePartId     = Guid.Parse("11111111-1111-1111-1111-111111111001"), // Air Filter
                    Quantity        = 15,
                    IsAvailable     = true,
                    Price           = 280.00m,
                    LowStockThreshold = 5,
                    IsFlaggedLowStock = false,
                    UpdatedAt       = DateTime.UtcNow
                },
                new Inventory
                {
                    Id              = Guid.NewGuid(),
                    ServiceCenterId = ServiceCenterId,
                    SparePartId     = Guid.Parse("11111111-1111-1111-1111-111111111004"), // Spark Plug
                    Quantity        = 30,
                    IsAvailable     = true,
                    Price           = 120.00m,
                    LowStockThreshold = 10,
                    IsFlaggedLowStock = false,
                    UpdatedAt       = DateTime.UtcNow
                },
                new Inventory
                {
                    Id              = Guid.NewGuid(),
                    ServiceCenterId = ServiceCenterId,
                    SparePartId     = Guid.Parse("11111111-1111-1111-1111-111111111005"), // Oil Filter
                    Quantity        = 25,
                    IsAvailable     = true,
                    Price           = 180.00m,
                    LowStockThreshold = 5,
                    IsFlaggedLowStock = false,
                    UpdatedAt       = DateTime.UtcNow
                }
               
            };

                await _context.Inventories.AddRangeAsync(inventories);
                await _context.SaveChangesAsync();
            }
        }
    }
