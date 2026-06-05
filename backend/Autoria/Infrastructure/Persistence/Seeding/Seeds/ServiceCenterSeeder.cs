using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class ServiceCenterSeeder
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly GeometryFactory _geometryFactory;

        public ServiceCenterSeeder(AppDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
            // standard GPS coordinate reference system (WGS 84)
            _geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        }

        public async Task SeedAsync()
        {
            try
            {
                // 1. REMOVE the "if (await _context.ServiceCenters.AnyAsync()) return;" check completely from here!

                // Retrieve the seeded owner from UserSeeder
                var owner = await _userManager.FindByEmailAsync("jana3@gmail.com");
                if (owner == null)
                {
                    throw new Exception("Cannot seed Service Centers because the owner user 'jana3@gmail.com' was not found.");
                }

                // Retrieve existing lookup items to map junction tables safely
                var brands = await _context.CarBrands.ToListAsync();
                var serviceTypes = await _context.ServiceTypes.ToListAsync();

                // Define baseline static IDs so we don't duplicate items across runs
                var center1Id = Guid.Parse("aa11bb22-33cc-44dd-55ee-66ff77aa88bb");
                var center2Id = Guid.Parse("bb22cc33-44dd-55ee-66ff-77aa88bb99cc");
                var center3Id = Guid.Parse("cc33dd44-55ee-66ff-77aa-88bb99cc00dd");
                var center4Id = Guid.Parse("dd44ee55-66ff-77aa-88bb-99cc00ddee11");
                var center5Id = Guid.Parse("ee55ff66-77aa-88bb-99cc-00ddee112233");
                var center6Id = Guid.Parse("ff66aa77-88bb-99cc-00dd-ee1122334455");
                var center7Id = Guid.Parse("11111111-aaaa-bbbb-cccc-111111111111");
                var center8Id = Guid.Parse("22222222-aaaa-bbbb-cccc-222222222222");
                var center9Id = Guid.Parse("33333333-aaaa-bbbb-cccc-333333333333");
                var center10Id = Guid.Parse("44444444-aaaa-bbbb-cccc-444444444444");
                var center11Id = Guid.Parse("55555555-aaaa-bbbb-cccc-555555555555");
                var center12Id = Guid.Parse("66666666-aaaa-bbbb-cccc-666666666666");
                var center13Id = Guid.Parse("77777777-aaaa-bbbb-cccc-777777777777");
                var center14Id = Guid.Parse("88888888-aaaa-bbbb-cccc-888888888888");
                var center15Id = Guid.Parse("99999999-aaaa-bbbb-cccc-999999999999");
                var center16Id = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
                var center17Id = Guid.Parse("bbbbbbbb-cccc-dddd-eeee-ffffffffffff");

                var centersToProcess = new List<ServiceCenter>
        {
            // ================= CENTER 1: Maadi, Cairo =================
            new ServiceCenter
            {
                Id = center1Id,
                UserId = owner.Id,
                Name = "El-Ahram Auto Care Center",
                Phone = "01225167890",
                BusinessEmail = "info@elahramautocare.com",
                YearEstablished = 2012,
                Description = "Premium multi-brand maintenance facility specialized in mechanical, electrical, and air conditioning systems.",
                CommercialRegNo = "CR-994827",
                TaxCardNo = "TX-440-291-8",
                OwnerNationalId = "29205120104839",
                OwnerFullName = "Jana Ahmad",
                NumServiceBays = 6,
                Type = ServiceCenterType.Maintenance,
                ApprovalStatus = ApprovalStatus.Approved,
                SubmittedAt = DateTime.Now.AddMonths(-2),
                ApprovedAt = DateTime.Now.AddMonths(-2).AddDays(2),
                CreatedAt = DateTime.Now.AddMonths(-2),
                Rating = 4.8,
                Address = "Building 14, Street 9, Maadi, Cairo, Egypt",
                Location = _geometryFactory.CreatePoint(new Coordinate(31.2585, 29.9602))
            },

            // ================= CENTER 2: Dokki, Giza =================
            new ServiceCenter
            {
                Id = center2Id,
                UserId = owner.Id,
                Name = "German Engineering VAG Workshop",
                Phone = "01174988211",
                BusinessEmail = "dokki@germanengworkshops.com",
                YearEstablished = 2018,
                Description = "Specialized VAG engineering workshop offering high-end diagnostic setups and genuine replacement spares.",
                CommercialRegNo = "CR-102938",
                TaxCardNo = "TX-883-112-4",
                OwnerNationalId = "29205120104839",
                OwnerFullName = "Jana Ahmad",
                NumServiceBays = 4,
                Type = ServiceCenterType.Maintenance,
                ApprovalStatus = ApprovalStatus.Approved,
                SubmittedAt = DateTime.Now.AddMonths(-1),
                ApprovedAt = DateTime.Now.AddMonths(-1).AddDays(1),
                CreatedAt = DateTime.Now.AddMonths(-1),
                Rating = 4.5,
                Address = "45 El-Ansar Street, Dokki, Giza, Egypt",
                Location = _geometryFactory.CreatePoint(new Coordinate(31.2114, 30.0374))
            },
                new ServiceCenter
{
    Id = center3Id,
    UserId = owner.Id,
    Name = "Cairo Auto Service Hub",
    Phone = "01587654322",
    BusinessEmail = "info@alexmotorshub.com",
    YearEstablished = 2015,
    Description = "Full-service automotive repair center in Alexandria specializing in Japanese and Korean vehicles.",
    CommercialRegNo = "CR-554433",
    TaxCardNo = "TX-554433",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 8,
    Type = ServiceCenterType.Maintenance,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-4),
    ApprovedAt = DateTime.Now.AddMonths(-4).AddDays(3),
    CreatedAt = DateTime.Now.AddMonths(-4),
    Rating = 4.7,
    Address = "El Shorouk City, Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(
    new Coordinate(31.6260, 30.1260)),
},

new ServiceCenter
{
    Id = center4Id,
    UserId = owner.Id,
    Name = "Elite German Cars Center",
    Phone = "01099887766",
    BusinessEmail = "service@elitegermancars.com",
    YearEstablished = 2017,
    Description = "BMW, Mercedes-Benz, Audi and Volkswagen specialists.",
    CommercialRegNo = "CR-667788",
    TaxCardNo = "TX-667788",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 5,
    Type = ServiceCenterType.Maintenance,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-3),
    ApprovedAt = DateTime.Now.AddMonths(-3).AddDays(2),
    CreatedAt = DateTime.Now.AddMonths(-3),
    Rating = 4.9,
    Address = "New Cairo, Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(new Coordinate(31.4913, 30.0276))
},

new ServiceCenter
{
    Id = center5Id,
    UserId = owner.Id,
    Name = "October Auto Clinic",
    Phone = "01282199882",
    BusinessEmail = "support@octoberautoclinic.com",
    YearEstablished = 2019,
    Description = "Quick maintenance, oil changes, diagnostics and suspension repair.",
    CommercialRegNo = "CR-445522",
    TaxCardNo = "TX-445522",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 7,
    Type = ServiceCenterType.Maintenance,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-2),
    ApprovedAt = DateTime.Now.AddMonths(-2).AddDays(1),
    CreatedAt = DateTime.Now.AddMonths(-2),
    Rating = 4.4,
    Address = "6th of October City, Giza, Egypt",
    Location = _geometryFactory.CreatePoint(new Coordinate(30.9756, 29.9725))
},

new ServiceCenter
{
    Id = center6Id,
    UserId = owner.Id,
    Name = "Delta Auto Solutions",
    Phone = "01022334452",
    BusinessEmail = "info@deltaautosolutions.com",
    YearEstablished = 2014,
    Description = "Advanced diagnostics, engine repair and electrical systems maintenance.",
    CommercialRegNo = "CR-778899",
    TaxCardNo = "TX-778899",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 9,
    Type = ServiceCenterType.PartsStore,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-5),
    ApprovedAt = DateTime.Now.AddMonths(-5).AddDays(2),
    CreatedAt = DateTime.Now.AddMonths(-5),
    Rating = 4.6,
    Address = "Obour City, Cairo, Egypt",
     Location = _geometryFactory.CreatePoint(
    new Coordinate(31.4770, 30.2280)),
},new ServiceCenter
{
    Id = center7Id,
    UserId = owner.Id,
    Name = "Toyota Service Center - Sheikh Zayed",
    Phone = "01189389072",
    BusinessEmail = "zayed@toyotaservice.com",
    YearEstablished = 2016,
    Description = "Authorized Toyota maintenance center providing diagnostics, repairs and genuine spare parts.",
    CommercialRegNo = "CR-884521",
    TaxCardNo = "TX-884521",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 14,
    Type = ServiceCenterType.Maintenance,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-8),
    ApprovedAt = DateTime.Now.AddMonths(-8).AddDays(2),
    CreatedAt = DateTime.Now.AddMonths(-8),
    Rating = 4.8,
    Address = "Sheikh Zayed, Giza, Egypt",
    Location = _geometryFactory.CreatePoint(new Coordinate(30.9428, 30.0131))
},

new ServiceCenter
{
    Id = center8Id,
    UserId = owner.Id,
    Name = "BMW Excellence Workshop",
    Phone = "01022114455",
    BusinessEmail = "info@bmwexcellence.com",
    YearEstablished = 2014,
    Description = "BMW and MINI specialists offering diagnostics, maintenance and performance upgrades.",
    CommercialRegNo = "CR-447822",
    TaxCardNo = "TX-447822",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 10,
    Type = ServiceCenterType.Maintenance,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-10),
    ApprovedAt = DateTime.Now.AddMonths(-10).AddDays(1),
    CreatedAt = DateTime.Now.AddMonths(-10),
    Rating = 4.9,
    Address = "El Rehab, New Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(new Coordinate(31.4919, 30.0686))
},

new ServiceCenter
{
    Id = center9Id,
    UserId = owner.Id,
    Name = "German Auto Clinic",
    Phone = "01066778899",
    BusinessEmail = "service@germanautoclinic.com",
    YearEstablished = 2018,
    Description = "Specialized in Mercedes-Benz, Audi, Volkswagen and BMW maintenance.",
    CommercialRegNo = "CR-558811",
    TaxCardNo = "TX-558811",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 8,
    Type = ServiceCenterType.Both,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-6),
    ApprovedAt = DateTime.Now.AddMonths(-6).AddDays(1),
    CreatedAt = DateTime.Now.AddMonths(-6),
    Rating = 4.7,
    Address = "Heliopolis, Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(new Coordinate(31.3300, 30.0915))
},

new ServiceCenter
{
    Id = center10Id,
    UserId = owner.Id,
    Name = "Auto Experts Egypt",
    Phone = "01588221178",
    BusinessEmail = "info@alexautoexperts.com",
    YearEstablished = 2013,
    Description = "Comprehensive maintenance center serving Japanese and European vehicles.",
    CommercialRegNo = "CR-663322",
    TaxCardNo = "TX-663322",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 12,
    Type = ServiceCenterType.PartsStore,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-12),
    ApprovedAt = DateTime.Now.AddMonths(-12).AddDays(2),
    CreatedAt = DateTime.Now.AddMonths(-12),
    Rating = 4.6,
Address = "Badr City, Cairo, Egypt",
Location = _geometryFactory.CreatePoint(
    new Coordinate(31.7390, 30.1450)),
},

new ServiceCenter
{
    Id = center11Id,
    UserId = owner.Id,
    Name = "Nile Motors Service",
    Phone = "01044556677",
    BusinessEmail = "support@nilemotors.com",
    YearEstablished = 2011,
    Description = "Engine diagnostics, suspension repairs, electrical systems and periodic maintenance.",
    CommercialRegNo = "CR-993377",
    TaxCardNo = "TX-993377",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 9,
    Type = ServiceCenterType.Maintenance,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-15),
    ApprovedAt = DateTime.Now.AddMonths(-15).AddDays(3),
    CreatedAt = DateTime.Now.AddMonths(-15),
    Rating = 4.5,
    Address = "Nasr City, Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(new Coordinate(31.3470, 30.0605))
},

new ServiceCenter
{
    Id = center12Id,
    UserId = owner.Id,
    Name = "New Cairo Auto Experts",
    Phone = "01077889900",
    BusinessEmail = "info@fasttrackauto.com",
    YearEstablished = 2020,
    Description = "Modern maintenance center focused on fast service and computerized diagnostics.",
    CommercialRegNo = "CR-441188",
    TaxCardNo = "TX-441188",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 6,
    Type = ServiceCenterType.PartsStore,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-4),
    ApprovedAt = DateTime.Now.AddMonths(-4).AddDays(1),
    CreatedAt = DateTime.Now.AddMonths(-4),
    Rating = 4.4,
    Address = "Fifth Settlement, New Cairo, Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(
        new Coordinate(31.4912, 30.0284))
},

new ServiceCenter
{
    Id = center13Id,
    UserId = owner.Id,
    Name = "Shorouk Automotive Center",
    Phone = "01033445562",
    BusinessEmail = "service@canalauto.com",
    YearEstablished = 2017,
    Description = "Maintenance and repair center serving Ismailia and Canal region customers.",
    CommercialRegNo = "CR-772244",
    TaxCardNo = "TX-772244",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 7,
    Type = ServiceCenterType.Both,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-7),
    ApprovedAt = DateTime.Now.AddMonths(-7).AddDays(2),
    CreatedAt = DateTime.Now.AddMonths(-7),
    Rating = 4.5,
Address = "El Shorouk City, Cairo, Egypt",
Location = _geometryFactory.CreatePoint(
    new Coordinate(31.6300, 30.1300)),
},

new ServiceCenter
{
    Id = center14Id,
    UserId = owner.Id,
    Name = "Obour Auto Solutions",
    Phone = "01222311334",
    BusinessEmail = "info@upperegyptauto.com",
    YearEstablished = 2012,
    Description = "Advanced engine and transmission repair center serving Upper Egypt.",
    CommercialRegNo = "CR-118833",
    TaxCardNo = "TX-118833",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 11,
    Type = ServiceCenterType.Maintenance,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-14),
    ApprovedAt = DateTime.Now.AddMonths(-14).AddDays(2),
    CreatedAt = DateTime.Now.AddMonths(-14),
    Rating = 4.6,
Address = "Obour City, Cairo, Egypt",
Location = _geometryFactory.CreatePoint(
    new Coordinate(31.4800, 30.2300)),
},new ServiceCenter
{
    Id = center15Id,
    UserId = owner.Id,
    Name = "Shorouk Motors Center",
    Phone = "01055667788",
    BusinessEmail = "info@shoroukmotors.com",
    YearEstablished = 2018,
    Description = "General maintenance, diagnostics and suspension services.",
    CommercialRegNo = "CR-992211",
    TaxCardNo = "TX-992211",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 8,
    Type = ServiceCenterType.Maintenance,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-6),
    ApprovedAt = DateTime.Now.AddMonths(-6).AddDays(2),
    CreatedAt = DateTime.Now.AddMonths(-6),
    Rating = 4.7,
    Address = "El Shorouk City, Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(
        new Coordinate(31.6350, 30.1250))
},

new ServiceCenter
{
    Id = center16Id,
    UserId = owner.Id,
    Name = "Obour Car Care",
    Phone = "01166778899",
    BusinessEmail = "service@obourcarcare.com",
    YearEstablished = 2016,
    Description = "Engine diagnostics, maintenance and electrical repairs.",
    CommercialRegNo = "CR-776655",
    TaxCardNo = "TX-776655",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 10,
    Type = ServiceCenterType.Both,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-8),
    ApprovedAt = DateTime.Now.AddMonths(-8).AddDays(1),
    CreatedAt = DateTime.Now.AddMonths(-8),
    Rating = 4.8,
    Address = "Obour City, Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(
        new Coordinate(31.4850, 30.2200))
},

new ServiceCenter
{
    Id = center17Id,
    UserId = owner.Id,
    Name = "Badr Auto Hub",
    Phone = "01512345678",
    BusinessEmail = "info@badrautohub.com",
    YearEstablished = 2020,
    Description = "Modern service center with advanced diagnostics equipment.",
    CommercialRegNo = "CR-334455",
    TaxCardNo = "TX-334455",
    OwnerNationalId = "29205120104839",
    OwnerFullName = "Jana Ahmad",
    NumServiceBays = 6,
    Type = ServiceCenterType.Both,
    ApprovalStatus = ApprovalStatus.Approved,
    SubmittedAt = DateTime.Now.AddMonths(-3),
    ApprovedAt = DateTime.Now.AddMonths(-3).AddDays(1),
    CreatedAt = DateTime.Now.AddMonths(-3),
    Rating = 4.6,
    Address = "Badr City, Cairo, Egypt",
    Location = _geometryFactory.CreatePoint(
        new Coordinate(31.7500, 30.1400))
},

        };

                bool databaseChanged = false;

                foreach (var center in centersToProcess)
                {
                    // This granular check handles the upsert loop safely!
                    var existingCenter = await _context.ServiceCenters
                        .FirstOrDefaultAsync(c => c.Id == center.Id || c.BusinessEmail == center.BusinessEmail);

                    if (existingCenter != null)
                    {
                        continue; // Skip seeding if this specific center is already there
                    }

                    // Generate Operating Hours
                    for (int d = 0; d < 7; d++)
                    {
                        var day = (DayOfWeek)d;
                        center.OperatingHours.Add(new OperatingHours
                        {
                            Id = Guid.NewGuid(),
                            Day = day,
                            OpenTime = new TimeOnly(9, 0),
                            CloseTime = new TimeOnly(21, 0),
                            IsClosed = day == DayOfWeek.Friday
                        });
                    }

                    // Map Car Brands
                    foreach (var brand in brands.Take(4))
                    {
                        center.CarBrands.Add(new ServiceCenterCarBrand
                        {
                            Id = Guid.NewGuid(),
                            CarBrandId = brand.Id
                        });
                    }

                    // Map Service Types
                    foreach (var service in serviceTypes.Take(3))
                    {
                        center.ServiceTypes.Add(new ServiceCenterServiceType
                        {
                            Id = Guid.NewGuid(),
                            ServiceTypeId = service.ServiceTypeId
                        });
                    }

                    string fallbackPhoto = center.Id == center1Id
                        ? "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600"
                        : "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600";

                    center.Photos.Add(new ServiceCenterPhoto
                    {
                        Id = Guid.NewGuid(),
                        PhotoUrl = fallbackPhoto,
                        UploadedAt = DateTime.Now
                    });

                    _context.ServiceCenters.Add(center);
                    databaseChanged = true;
                }

                if (databaseChanged)
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine("Successfully seeded new Egyptian service centers.");
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Service Center seeding failed: {ex.Message}");
            }
        }
    }
}