using Autoria.features.SpareParts.Entities;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class SparePartCompatibilitySeeder
    {
        private readonly AppDbContext _context;

        public SparePartCompatibilitySeeder(AppDbContext context)
        {
            _context = context;
        }
        public async Task SeedAsync()
        {
            var compatibilities = new List<SparePartCompatibility>
{
    // Oil Filter
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111001"),
        CarMake = "Toyota",
        CarModel = "Corolla",
        YearFrom = 2014,
        YearTo = 2024
    },
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111001"),
        CarMake = "Hyundai",
        CarModel = "Elantra",
        YearFrom = 2012,
        YearTo = 2024
    },

    // Brake Pads Front
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111002"),
        CarMake = "Hyundai",
        CarModel = "Elantra HD",
        YearFrom = 2007,
        YearTo = 2016
    },
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111002"),
        CarMake = "Kia",
        CarModel = "Cerato",
        YearFrom = 2009,
        YearTo = 2021
    },

    // Spark Plug
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111003"),
        CarMake = "Nissan",
        CarModel = "Sunny",
        YearFrom = 2005,
        YearTo = 2024
    },
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111003"),
        CarMake = "Toyota",
        CarModel = "Yaris",
        YearFrom = 2010,
        YearTo = 2024
    },

    // Timing Belt Kit
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111004"),
        CarMake = "Volkswagen",
        CarModel = "Jetta",
        YearFrom = 2012,
        YearTo = 2021
    },
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111004"),
        CarMake = "Skoda",
        CarModel = "Octavia",
        YearFrom = 2013,
        YearTo = 2022
    },

    // Engine Oil 5W30
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111005"),
        CarMake = "BMW",
        CarModel = "320i",
        YearFrom = 2012,
        YearTo = 2024
    },
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111005"),
        CarMake = "Mercedes-Benz",
        CarModel = "C180",
        YearFrom = 2013,
        YearTo = 2024
    },

    // Cabin Air Filter
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111006"),
        CarMake = "Hyundai",
        CarModel = "Accent RB",
        YearFrom = 2011,
        YearTo = 2023
    },

    // Fuel Filter
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111007"),
        CarMake = "Chevrolet",
        CarModel = "Optra",
        YearFrom = 2008,
        YearTo = 2020
    },

    // Transmission Oil Filter
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111008"),
        CarMake = "Toyota",
        CarModel = "Corolla",
        YearFrom = 2014,
        YearTo = 2024
    },

    // Brake Pads Rear
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111009"),
        CarMake = "Kia",
        CarModel = "Cerato",
        YearFrom = 2013,
        YearTo = 2023
    },

    // Brake Disc Front
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111010"),
        CarMake = "BMW",
        CarModel = "320i",
        YearFrom = 2012,
        YearTo = 2022
    },

    // Brake Disc Rear
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111011"),
        CarMake = "BMW",
        CarModel = "320i",
        YearFrom = 2012,
        YearTo = 2022
    },

    // Iridium Spark Plug
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111012"),
        CarMake = "Toyota",
        CarModel = "Corolla",
        YearFrom = 2014,
        YearTo = 2024
    },

    // Ignition Coil
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111013"),
        CarMake = "Hyundai",
        CarModel = "Elantra",
        YearFrom = 2012,
        YearTo = 2024
    },

    // Distributor Cap
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111014"),
        CarMake = "Toyota",
        CarModel = "Corolla",
        YearFrom = 1998,
        YearTo = 2007
    },

    // Serpentine Belt
    new()
    {
        Id = Guid.NewGuid(),
        SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111015"),
        CarMake = "Hyundai",
        CarModel = "Accent",
        YearFrom = 2011,
        YearTo = 2022
    }
};
        }
    }
}
