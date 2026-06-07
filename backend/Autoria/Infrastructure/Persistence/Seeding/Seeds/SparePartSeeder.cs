using Autoria.features.SpareParts.Entities;
using Autoria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class SparePartSeeder
    {
        private readonly AppDbContext _context;
        private const string AdminId = "741eab40-d744-4821-90df-36ef8802c341";

        public SparePartSeeder(AppDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            var existingPartNumbers = await _context.SpareParts
                .Select(sp => sp.PartNumber)
                .ToListAsync();

            var spareParts = new List<SparePart>
            {
                // ─── Filters ───────────────────────────────────────────
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111001"), CreatedById = AdminId, Name = "Oil Filter", Category = "Filters", Brand = "Mann-Filter", Model = "W 712/75", PartNumber = "MN-W71275", CountryOfOrigin = "Germany", Manufacturer = "Mann+Hummel", Description = "High-quality oil filter compatible with most Japanese and European cars.", ProductionDate = new DateOnly(2023, 6, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111006"), CreatedById = AdminId, Name = "Cabin Air Filter", Category = "Filters", Brand = "Bosch", Model = "CF10435", PartNumber = "BS-CF10435", CountryOfOrigin = "Germany", Manufacturer = "Robert Bosch GmbH", Description = "Activated carbon cabin filter that removes dust, pollen, and harmful gases from interior air.", ProductionDate = new DateOnly(2023, 9, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111007"), CreatedById = AdminId, Name = "Fuel Filter", Category = "Filters", Brand = "Bosch", Model = "F026402062", PartNumber = "BS-F026402062", CountryOfOrigin = "Germany", Manufacturer = "Robert Bosch GmbH", Description = "Inline fuel filter that removes contaminants from the fuel system to protect the engine.", ProductionDate = new DateOnly(2023, 5, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111008"), CreatedById = AdminId, Name = "Transmission Oil Filter", Category = "Filters", Brand = "Mann-Filter", Model = "H 2016", PartNumber = "MN-H2016", CountryOfOrigin = "Germany", Manufacturer = "Mann+Hummel", Description = "Automatic transmission oil filter for clean fluid circulation and smooth gear shifting.", ProductionDate = new DateOnly(2023, 7, 1), IsActive = true, CreatedAt = DateTime.UtcNow },

                // ─── Brakes ────────────────────────────────────────────
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111002"), CreatedById = AdminId, Name = "Brake Pads Front", Category = "Brakes", Brand = "Brembo", Model = "P 23 057", PartNumber = "BR-P23057", CountryOfOrigin = "Italy", Manufacturer = "Brembo S.p.A", Description = "Front brake pads with low dust formula, compatible with Toyota Corolla and Hyundai Elantra.", ProductionDate = new DateOnly(2023, 8, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111009"),CreatedById = AdminId, Name = "Brake Pads Rear", Category = "Brakes", Brand = "Brembo", Model = "P 23 058", PartNumber = "BR-P23058", CountryOfOrigin = "Italy", Manufacturer = "Brembo S.p.A", Description = "Rear brake pads with ceramic compound for quiet and efficient braking.", ProductionDate = new DateOnly(2023, 8, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111010"),CreatedById = AdminId, Name = "Brake Disc Front", Category = "Brakes", Brand = "Brembo", Model = "09.A349.11", PartNumber = "BR-09A34911", CountryOfOrigin = "Italy", Manufacturer = "Brembo S.p.A", Description = "Ventilated front brake disc for enhanced stopping power and heat dissipation.", ProductionDate = new DateOnly(2023, 8, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111011"),CreatedById = AdminId, Name = "Brake Disc Rear", Category = "Brakes", Brand = "Brembo", Model = "09.A350.11", PartNumber = "BR-09A35011", CountryOfOrigin = "Italy", Manufacturer = "Brembo S.p.A", Description = "Solid rear brake disc with anti-corrosion coating for extended service life.", ProductionDate = new DateOnly(2023, 8, 1), IsActive = true, CreatedAt = DateTime.UtcNow },

                // ─── Ignition ──────────────────────────────────────────
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111003"), CreatedById = AdminId, Name = "Spark Plug", Category = "Ignition", Brand = "NGK", Model = "BKR6E", PartNumber = "NGK-BKR6E", CountryOfOrigin = "Japan", Manufacturer = "NGK Spark Plugs", Description = "Standard copper spark plug suitable for a wide range of petrol engines.", ProductionDate = new DateOnly(2023, 3, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111012"), CreatedById = AdminId, Name = "Iridium Spark Plug", Category = "Ignition", Brand = "Denso", Model = "IK20", PartNumber = "DN-IK20", CountryOfOrigin = "Japan", Manufacturer = "Denso Corporation", Description = "Long-life iridium spark plug for improved fuel economy and engine performance.", ProductionDate = new DateOnly(2023, 5, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111013"), CreatedById = AdminId, Name = "Ignition Coil", Category = "Ignition", Brand = "Bosch", Model = "0221504470", PartNumber = "BS-0221504470", CountryOfOrigin = "Germany", Manufacturer = "Robert Bosch GmbH", Description = "Direct ignition coil providing strong and consistent spark for reliable engine starting.", ProductionDate = new DateOnly(2023, 6, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111014"), CreatedById = AdminId, Name = "Distributor Cap", Category = "Ignition", Brand = "NGK", Model = "DC-12", PartNumber = "NGK-DC12", CountryOfOrigin = "Japan", Manufacturer = "NGK Spark Plugs", Description = "Distributor cap for precise ignition timing on older engine models.", ProductionDate = new DateOnly(2022, 11, 1), IsActive = true, CreatedAt = DateTime.UtcNow },

                // ─── Engine ────────────────────────────────────────────
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111004"), CreatedById = AdminId, Name = "Timing Belt Kit", Category = "Engine", Brand = "Gates", Model = "TCK328", PartNumber = "GT-TCK328", CountryOfOrigin = "USA", Manufacturer = "Gates Corporation", Description = "Complete timing belt kit including belt, tensioner, and idler pulley.", ProductionDate = new DateOnly(2023, 2, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111015"), CreatedById = AdminId, Name = "Serpentine Belt", Category = "Engine", Brand = "Gates", Model = "K060995", PartNumber = "GT-K060995", CountryOfOrigin = "USA", Manufacturer = "Gates Corporation", Description = "Multi-rib serpentine belt for driving alternator, power steering pump, and AC compressor.", ProductionDate = new DateOnly(2023, 3, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111016"), CreatedById = AdminId, Name = "Valve Cover Gasket", Category = "Engine", Brand = "Victor Reinz", Model = "71-52465-00", PartNumber = "VR-71524650", CountryOfOrigin = "Germany", Manufacturer = "Dana Victor Reinz", Description = "Valve cover gasket that prevents oil leaks from the top of the engine.", ProductionDate = new DateOnly(2023, 4, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111017"), CreatedById = AdminId, Name = "Head Gasket", Category = "Engine", Brand = "Elring", Model = "764.253", PartNumber = "EL-764253", CountryOfOrigin = "Germany", Manufacturer = "ElringKlinger AG", Description = "Multi-layer steel head gasket providing reliable seal between engine block and cylinder head.", ProductionDate = new DateOnly(2023, 1, 1), IsActive = true, CreatedAt = DateTime.UtcNow },

                // ─── Oils & Fluids ─────────────────────────────────────
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111005"), CreatedById = AdminId, Name = "Engine Oil 5W-30", Category = "Oils & Fluids", Brand = "Castrol", Model = "EDGE 5W-30", PartNumber = "CS-EDGE5W30", CountryOfOrigin = "UK", Manufacturer = "Castrol Limited", Description = "Fully synthetic engine oil for maximum engine protection under extreme conditions.", ProductionDate = new DateOnly(2023, 7, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111018"), CreatedById = AdminId, Name = "Engine Oil 10W-40", Category = "Oils & Fluids", Brand = "Mobil", Model = "Super 3000 X1", PartNumber = "MB-S3000X1-10W40", CountryOfOrigin = "USA", Manufacturer = "ExxonMobil", Description = "Semi-synthetic engine oil suitable for older engines and high mileage vehicles.", ProductionDate = new DateOnly(2023, 8, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111019"), CreatedById = AdminId, Name = "Brake Fluid DOT 4", Category = "Oils & Fluids", Brand = "Bosch", Model = "DOT4", PartNumber = "BS-DOT4-500ML", CountryOfOrigin = "Germany", Manufacturer = "Robert Bosch GmbH", Description = "High-performance DOT 4 brake fluid with high boiling point for reliable braking.", ProductionDate = new DateOnly(2023, 6, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111020"), CreatedById = AdminId, Name = "Coolant Antifreeze", Category = "Oils & Fluids", Brand = "Prestone", Model = "AF2100", PartNumber = "PR-AF2100", CountryOfOrigin = "USA", Manufacturer = "Prestone Products Corporation", Description = "Long-life antifreeze and coolant that protects against overheating and corrosion.", ProductionDate = new DateOnly(2023, 5, 1), IsActive = true, CreatedAt = DateTime.UtcNow },

                // ─── Suspension ────────────────────────────────────────
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111021"), CreatedById = AdminId, Name = "Shock Absorber Front", Category = "Suspension", Brand = "KYB", Model = "333328", PartNumber = "KYB-333328", CountryOfOrigin = "Japan", Manufacturer = "KYB Corporation", Description = "Front shock absorber for improved ride comfort and handling stability.", ProductionDate = new DateOnly(2023, 1, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111022"), CreatedById = AdminId, Name = "Shock Absorber Rear", Category = "Suspension", Brand = "KYB", Model = "333329", PartNumber = "KYB-333329", CountryOfOrigin = "Japan", Manufacturer = "KYB Corporation", Description = "Rear shock absorber for a smooth and controlled ride on Egyptian road conditions.", ProductionDate = new DateOnly(2023, 1, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111023"), CreatedById = AdminId, Name = "Strut Mount", Category = "Suspension", Brand = "Lemförder", Model = "37722 01", PartNumber = "LM-3772201", CountryOfOrigin = "Germany", Manufacturer = "ZF Friedrichshafen AG", Description = "Front strut mount that reduces vibration and noise transmitted to the cabin.", ProductionDate = new DateOnly(2023, 2, 1), IsActive = true, CreatedAt = DateTime.UtcNow },

                // ─── Electrical ────────────────────────────────────────
                new SparePart { Id =Guid.Parse("11111111-1111-1111-1111-111111111024"), CreatedById = AdminId, Name = "Alternator", Category = "Electrical", Brand = "Bosch", Model = "AL0825N", PartNumber = "BS-AL0825N", CountryOfOrigin = "Germany", Manufacturer = "Robert Bosch GmbH", Description = "Remanufactured alternator providing reliable electrical power generation.", ProductionDate = new DateOnly(2022, 11, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id =Guid.Parse("11111111-1111-1111-1111-111111111025"), CreatedById = AdminId, Name = "Battery 60Ah", Category = "Electrical", Brand = "Varta", Model = "D24", PartNumber = "VT-D24-60", CountryOfOrigin = "Germany", Manufacturer = "Clarios Germany GmbH", Description = "60Ah maintenance-free car battery suitable for most compact and mid-size vehicles.", ProductionDate = new DateOnly(2023, 10, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id =Guid.Parse("11111111-1111-1111-1111-111111111026"), CreatedById = AdminId, Name = "Battery 74Ah", Category = "Electrical", Brand = "Varta", Model = "E11", PartNumber = "VT-E11-74", CountryOfOrigin = "Germany", Manufacturer = "Clarios Germany GmbH", Description = "74Ah AGM battery suitable for vehicles with start-stop systems.", ProductionDate = new DateOnly(2023, 10, 1), IsActive = true, CreatedAt = DateTime.UtcNow },

                // ─── Cooling ───────────────────────────────────────────
                new SparePart { Id =Guid.Parse("11111111-1111-1111-1111-111111111027"), CreatedById = AdminId, Name = "Radiator", Category = "Cooling", Brand = "Nissens", Model = "646647", PartNumber = "NS-646647", CountryOfOrigin = "Denmark", Manufacturer = "Nissens A/S", Description = "Aluminum radiator for efficient engine cooling, compatible with Kia and Hyundai models.", ProductionDate = new DateOnly(2023, 6, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id =Guid.Parse("11111111-1111-1111-1111-111111111028"), CreatedById = AdminId, Name = "Thermostat", Category = "Cooling", Brand = "Wahler", Model = "4226.82D", PartNumber = "WH-422682D", CountryOfOrigin = "Germany", Manufacturer = "Illinois Tool Works", Description = "Engine thermostat that regulates coolant temperature for optimal engine performance.", ProductionDate = new DateOnly(2023, 4, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
                new SparePart { Id =Guid.Parse("11111111-1111-1111-1111-111111111029"), CreatedById = AdminId, Name = "Water Pump", Category = "Cooling", Brand = "Graf", Model = "PA1046", PartNumber = "GR-PA1046", CountryOfOrigin = "Italy", Manufacturer = "Graf S.r.l", Description = "Water pump that circulates coolant through the engine to prevent overheating.", ProductionDate = new DateOnly(2023, 3, 1), IsActive = true, CreatedAt = DateTime.UtcNow },

                // ─── Air Conditioning ──────────────────────────────────
                new SparePart { Id = Guid.Parse("11111111-1111-1111-1111-111111111030"), CreatedById = AdminId, Name = "AC Compressor", Category = "Air Conditioning", Brand = "Denso", Model = "471-1244", PartNumber = "DN-4711244", CountryOfOrigin = "Japan", Manufacturer = "Denso Corporation", Description = "OEM-quality AC compressor for reliable air conditioning performance in hot climates.", ProductionDate = new DateOnly(2023, 4, 1), IsActive = true, CreatedAt = DateTime.UtcNow },
            };

            var newParts = spareParts
                .Where(sp => !existingPartNumbers.Contains(sp.PartNumber))
                .ToList();

            if (!newParts.Any()) return;

            await _context.SpareParts.AddRangeAsync(newParts);
            await _context.SaveChangesAsync();
        }
    }
}