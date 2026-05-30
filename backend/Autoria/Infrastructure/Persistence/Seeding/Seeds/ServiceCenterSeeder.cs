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

                var centersToProcess = new List<ServiceCenter>
        {
            // ================= CENTER 1: Maadi, Cairo =================
            new ServiceCenter
            {
                Id = center1Id,
                UserId = owner.Id,
                Name = "El-Ahram Auto Care Center",
                Phone = "0225167890",
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
                Phone = "0237498821",
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
            }
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