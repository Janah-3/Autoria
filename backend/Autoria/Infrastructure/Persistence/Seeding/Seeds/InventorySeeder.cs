
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
                },
    // Center 2
    new Inventory
    {
        Id = Guid.NewGuid(),
        ServiceCenterId = Guid.Parse("bb22cc33-44dd-55ee-66ff-77aa88bb99cc"),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111002"), // Brake Pads Front
        Quantity = 20,
        Price = 450,
        IsAvailable = true,
        LowStockThreshold = 5,
        UpdatedAt = DateTime.UtcNow
    },

    new Inventory
    {
        Id = Guid.NewGuid(),
        ServiceCenterId = Guid.Parse("bb22cc33-44dd-55ee-66ff-77aa88bb99cc"),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111001"), // Oil Filter
        Quantity = 15,
        Price = 180,
        IsAvailable = true,
        LowStockThreshold = 5,
        UpdatedAt = DateTime.UtcNow
    },

    // Center 6
    new Inventory
    {
        Id = Guid.NewGuid(),
        ServiceCenterId = Guid.Parse("ff66aa77-88bb-99cc-00dd-ee1122334455"),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111024"), // Alternator
        Quantity = 6,
        Price = 4200,
        IsAvailable = true,
        LowStockThreshold = 2,
        UpdatedAt = DateTime.UtcNow
    },

    new Inventory
    {
        Id = Guid.NewGuid(),
        ServiceCenterId = Guid.Parse("ff66aa77-88bb-99cc-00dd-ee1122334455"),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111025"), // Battery 60Ah
        Quantity = 10,
        Price = 2800,
        IsAvailable = true,
        LowStockThreshold = 3,
        UpdatedAt = DateTime.UtcNow
    },

    // Center 10
    new Inventory
    {
        Id = Guid.NewGuid(),
        ServiceCenterId = Guid.Parse("44444444-aaaa-bbbb-cccc-444444444444"),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111027"), // Radiator
        Quantity = 8,
        Price = 3500,
        IsAvailable = true,
        LowStockThreshold = 2,
        UpdatedAt = DateTime.UtcNow
    },

    // Center 12
    new Inventory
    {
        Id = Guid.NewGuid(),
        ServiceCenterId = Guid.Parse("66666666-aaaa-bbbb-cccc-666666666666"),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111021"), // Shock Absorber Front
        Quantity = 12,
        Price = 1700,
        IsAvailable = true,
        LowStockThreshold = 4,
        UpdatedAt = DateTime.UtcNow
    },

    // Center 16
    new Inventory
    {
        Id = Guid.NewGuid(),
        ServiceCenterId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111004"), // Timing Belt Kit
        Quantity = 5,
        Price = 2200,
        IsAvailable = true,
        LowStockThreshold = 2,
        UpdatedAt = DateTime.UtcNow
    },

    new Inventory
    {
        Id = Guid.NewGuid(),
        ServiceCenterId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111013"), // Ignition Coil
        Quantity = 7,
        Price = 950,
        IsAvailable = true,
        LowStockThreshold = 2,
        UpdatedAt = DateTime.UtcNow
    }

            };

                await _context.Inventories.AddRangeAsync(inventories);
                await _context.SaveChangesAsync();
            }
        }
    }
