
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
                    SparePartId     = Guid.Parse("42DF1DE5-9C10-4CBB-9605-DB2849E1971E"), // Brake Pads
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
                    SparePartId     = Guid.Parse("9D6D54A6-63DD-464B-B87D-1E5FBC8F1B16"), // Air Filter
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
                    SparePartId     = Guid.Parse("424C47BF-0398-4150-BE2D-B567595AB30B"), // Spark Plug
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
                    SparePartId     = Guid.Parse("329EA0DA-19F7-4F55-A616-C366A622C3D1"), // Oil Filter
                    Quantity        = 25,
                    IsAvailable     = true,
                    Price           = 180.00m,
                    LowStockThreshold = 5,
                    IsFlaggedLowStock = false,
                    UpdatedAt       = DateTime.UtcNow
                },
                new Inventory
                {
                    Id              = Guid.NewGuid(),
                    ServiceCenterId = ServiceCenterId,
                    SparePartId     = Guid.Parse("77C3B6E0-79D6-4B56-85EA-1118A2F78E06"), // Clutch Kit
                    Quantity        = 8,
                    IsAvailable     = true,
                    Price           = 1200.00m,
                    LowStockThreshold = 3,
                    IsFlaggedLowStock = false,
                    UpdatedAt       = DateTime.UtcNow
                },
            };

                await _context.Inventories.AddRangeAsync(inventories);
                await _context.SaveChangesAsync();
            }
        }
    }
