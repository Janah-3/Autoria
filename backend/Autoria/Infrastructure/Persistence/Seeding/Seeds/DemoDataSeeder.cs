using Autoria.features.Booking;
using Autoria.features.Booking.Entities;
using Autoria.features.Car.Entity;
using Autoria.features.MileageTracking.Entities;
using Autoria.features.Notifications.Entities;
using Autoria.features.Notifications.Enums;
using Autoria.features.PartReservations.Entities;
using Autoria.features.PartReservations.Enums;
using Autoria.features.Reviews.Entity;
using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.constants;
using Autoria.shared.Entities;
using Autoria.shared.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class DemoDataSeeder
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;

        // ================= DEMO USER (CAR OWNER) =================
        private const string DemoEmail = "jana.ayoub.004@gmail.com";
        private const string DemoUserId = "db0b0011-cafe-4a11-b000-0000000000d0";
        private const string DemoPassword = "Password@123";

        // References the static IDs used by ServiceCenterSeeder
        private static readonly Guid Center1Id = Guid.Parse("aa11bb22-33cc-44dd-55ee-66ff77aa88bb");
        private static readonly Guid Center2Id = Guid.Parse("bb22cc33-44dd-55ee-66ff-77aa88bb99cc");
        private static readonly Guid Center3Id = Guid.Parse("cc33dd44-55ee-66ff-77aa-88bb99cc00dd");
        private static readonly Guid Center5Id = Guid.Parse("ee55ff66-77aa-88bb-99cc-00ddee112233");
        private static readonly Guid Center7Id = Guid.Parse("11111111-aaaa-bbbb-cccc-111111111111");
        private static readonly Guid Center12Id = Guid.Parse("66666666-aaaa-bbbb-cccc-666666666666");

        // References the static IDs used by SparePartSeeder
        private static readonly Guid OilFilterId = Guid.Parse("11111111-1111-1111-1111-111111111001");
        private static readonly Guid BrakePadsFrontId = Guid.Parse("11111111-1111-1111-1111-111111111002");
        private static readonly Guid EngineOil5W30Id = Guid.Parse("11111111-1111-1111-1111-111111111005");
        private static readonly Guid IridiumSparkPlugId = Guid.Parse("11111111-1111-1111-1111-111111111012");

        // ================= DEMO CARS =================
        private static readonly Guid Car1Id = Guid.Parse("db0b0011-cafe-4a11-c001-000000000001");
        private static readonly Guid Car2Id = Guid.Parse("db0b0011-cafe-4a11-c001-000000000002");
        private static readonly Guid Car3Id = Guid.Parse("db0b0011-cafe-4a11-c001-000000000003");

        // ================= DEMO BOOKINGS =================
        private static readonly Guid Booking1Id = Guid.Parse("db0b0011-cafe-4a11-b001-000000000001");
        private static readonly Guid Booking2Id = Guid.Parse("db0b0011-cafe-4a11-b002-000000000001");
        private static readonly Guid Booking3Id = Guid.Parse("db0b0011-cafe-4a11-b003-000000000001");
        private static readonly Guid Booking4Id = Guid.Parse("db0b0011-cafe-4a11-b004-000000000001");
        private static readonly Guid Booking5Id = Guid.Parse("db0b0011-cafe-4a11-b005-000000000001");
        private static readonly Guid Booking6Id = Guid.Parse("db0b0011-cafe-4a11-b006-000000000001");

        // ================= DEMO REVIEWS =================
        private static readonly Guid Review1Id = Guid.Parse("db0b0011-cafe-4a11-d001-000000000001");
        private static readonly Guid Review2Id = Guid.Parse("db0b0011-cafe-4a11-d002-000000000001");

        public DemoDataSeeder(AppDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task SeedAsync()
        {
            try
            {
                // 1. Create/ensure the demo car owner account
                var demoUser = await _userManager.FindByEmailAsync(DemoEmail);

                if (demoUser == null)
                {
                    demoUser = new User
                    {
                        Id = DemoUserId,
                        UserName = "jana.ayoub",
                        FullName = "Jana Ayoub",
                        Email = DemoEmail,
                        IsBanned = false,
                        Created_At = DateTime.Now,
                        PhoneNumber = "01060338557",
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(demoUser, DemoPassword);

                    if (!result.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to create demo user: {string.Join(", ", result.Errors.Select(e => e.Description))}"
                        );
                    }

                    var roleResult = await _userManager.AddToRoleAsync(demoUser, Roles.User);

                    if (!roleResult.Succeeded)
                    {
                        throw new Exception(
                            $"Failed to add demo user role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}"
                        );
                    }
                }

                if (string.IsNullOrEmpty(demoUser.Id)) demoUser.Id = DemoUserId;

                // 2. Related demo data
                var brands = await _context.CarBrands.ToListAsync();
                var serviceTypes = await _context.ServiceTypes.ToListAsync();

                await SeedCarsAsync(demoUser.Id, brands);
                await SeedBookingsAsync(demoUser.Id, serviceTypes);
                await SeedReviewsAsync(demoUser.Id);
                await SeedNotificationsAsync(demoUser.Id);
                await SeedMileageAndRemindersAsync(demoUser.Id);
                await SeedPartReservationsAsync(demoUser.Id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Demo data seeding failed: {ex.Message}");
            }
        }

        private async Task SeedCarsAsync(string userId, List<CarBrand> brands)
        {
            var toyota = brands.FirstOrDefault(b => b.Name == "Toyota");
            var hyundai = brands.FirstOrDefault(b => b.Name == "Hyundai");
            var kia = brands.FirstOrDefault(b => b.Name == "Kia");

            var cars = new List<Car>
            {
                new Car
                {
                    CarId = Car1Id,
                    UserId = userId,
                    Make = "Toyota",
                    Model = "Corolla",
                    Year = 2022,
                    Vin = "JTDEAMDE0N0289401",
                    LicensePlate = "ABC 1234",
                    Mileage = 18400,
                    BrandId = toyota?.Id,
                    Color = "White",
                    Transmission = Transmission.Automatic,
                    FuelType = FuelType.Petrol,
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-8)
                },
                new Car
                {
                    CarId = Car2Id,
                    UserId = userId,
                    Make = "Hyundai",
                    Model = "Elantra",
                    Year = 2021,
                    Vin = "KMHDH4AE5MU192837",
                    LicensePlate = "DGF 5678",
                    Mileage = 31200,
                    BrandId = hyundai?.Id,
                    Color = "Silver",
                    Transmission = Transmission.Automatic,
                    FuelType = FuelType.Petrol,
                    IsPrimary = false,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6)
                },
                new Car
                {
                    CarId = Car3Id,
                    UserId = userId,
                    Make = "Kia",
                    Model = "Sportage",
                    Year = 2023,
                    Vin = "KNAPU81SBNA002938",
                    LicensePlate = "HJK 9012",
                    Mileage = 9600,
                    BrandId = kia?.Id,
                    Color = "Black",
                    Transmission = Transmission.Automatic,
                    FuelType = FuelType.Petrol,
                    IsPrimary = false,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3)
                }
            };

            foreach (var car in cars)
            {
                if (await _context.Cars.AnyAsync(c => c.CarId == car.CarId)) continue;
                _context.Cars.Add(car);
            }

            await _context.SaveChangesAsync();
        }

        private async Task SeedBookingsAsync(string userId, List<ServiceType> serviceTypes)
        {
            var oilChange = serviceTypes.FirstOrDefault(st => st.Name == "Oil Change");
            var brakes = serviceTypes.FirstOrDefault(st => st.Name == "Brakes");
            var acRepair = serviceTypes.FirstOrDefault(st => st.Name == "AC Repair");
            var tires = serviceTypes.FirstOrDefault(st => st.Name == "Tires");

            if (oilChange == null || brakes == null || acRepair == null || tires == null)
                throw new Exception("Required service types were not found while seeding demo bookings.");

            var now = DateTime.UtcNow;

            var bookings = new List<Booking>
            {
                new Booking
                {
                    Id = Booking1Id,
                    UserId = userId,
                    CarId = Car1Id,
                    ServiceCenterId = Center2Id,
                    ServiceTypeId = oilChange.ServiceTypeId,
                    Status = BookingStatus.Completed,
                    Appointment = now.AddDays(-45).AddHours(14),
                    Notes = "Full synthetic oil change + filter replacement.",
                    TotalPrice = 350m,
                    CompletedAt = now.AddDays(-45).AddHours(16),
                    CreatedAt = now.AddDays(-46)
                },
                new Booking
                {
                    Id = Booking2Id,
                    UserId = userId,
                    CarId = Car2Id,
                    ServiceCenterId = Center1Id,
                    ServiceTypeId = brakes.ServiceTypeId,
                    Status = BookingStatus.Completed,
                    Appointment = now.AddDays(-30).AddHours(11),
                    Notes = "Front brake pads and discs replacement.",
                    TotalPrice = 1200m,
                    CompletedAt = now.AddDays(-30).AddHours(13),
                    CreatedAt = now.AddDays(-31)
                },
                new Booking
                {
                    Id = Booking3Id,
                    UserId = userId,
                    CarId = Car1Id,
                    ServiceCenterId = Center7Id,
                    ServiceTypeId = oilChange.ServiceTypeId,
                    Status = BookingStatus.Confirmed,
                    Appointment = now.AddDays(1).AddHours(12),
                    Notes = "Regular 20,000 km service.",
                    TotalPrice = 400m,
                    CompletedAt = null,
                    CreatedAt = now.AddDays(-2)
                },
                new Booking
                {
                    Id = Booking4Id,
                    UserId = userId,
                    CarId = Car3Id,
                    ServiceCenterId = Center3Id,
                    ServiceTypeId = tires.ServiceTypeId,
                    Status = BookingStatus.Pending,
                    Appointment = now.AddDays(7).AddHours(15),
                    Notes = "Replace two front tires.",
                    TotalPrice = null,
                    CompletedAt = null,
                    CreatedAt = now.AddDays(-1)
                },
                new Booking
                {
                    Id = Booking5Id,
                    UserId = userId,
                    CarId = Car2Id,
                    ServiceCenterId = Center12Id,
                    ServiceTypeId = acRepair.ServiceTypeId,
                    Status = BookingStatus.Cancelled,
                    Appointment = now.AddDays(-15).AddHours(10),
                    Notes = "Air conditioning re-gas.",
                    TotalPrice = null,
                    CancellationReason = "Changed plans, will reschedule later.",
                    CompletedAt = null,
                    CreatedAt = now.AddDays(-16)
                },
                new Booking
                {
                    Id = Booking6Id,
                    UserId = userId,
                    CarId = Car1Id,
                    ServiceCenterId = Center5Id,
                    ServiceTypeId = oilChange.ServiceTypeId,
                    Status = BookingStatus.Rejected,
                    Appointment = now.AddDays(-9).AddHours(18),
                    Notes = "Engine oil top up.",
                    TotalPrice = null,
                    CompletedAt = null,
                    CreatedAt = now.AddDays(-10)
                }
            };

            foreach (var booking in bookings)
            {
                if (await _context.Bookings.AnyAsync(b => b.Id == booking.Id)) continue;
                _context.Bookings.Add(booking);
            }

            await _context.SaveChangesAsync();
        }

        private async Task SeedReviewsAsync(string userId)
        {
            var now = DateTime.UtcNow;

            if (!await _context.Reviews.AnyAsync(r => r.Id == Review1Id))
            {
                var review1 = new Review
                {
                    Id = Review1Id,
                    UserId = userId,
                    ServiceCenterId = Center2Id,
                    BookingId = Booking1Id,
                    Rating = 5,
                    Comment = "Excellent service! They replaced the oil and filter quickly and even did a full car check for free. Highly recommended.",
                    CreatedAt = now.AddDays(-44),
                    Photos = new List<ReviewPhoto>
                    {
                        new ReviewPhoto
                        {
                            Id = Guid.NewGuid(),
                            PhotoUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600",
                            UploadedAt = now.AddDays(-44)
                        }
                    }
                };

                _context.Reviews.Add(review1);
                await _context.SaveChangesAsync();

                _context.ReviewReplies.Add(new ReviewReply
                {
                    Id = Guid.NewGuid(),
                    ReviewId = Review1Id,
                    Comment = "Thank you so much for your trust! We look forward to serving you again.",
                    CreatedAt = now.AddDays(-43)
                });

                await _context.SaveChangesAsync();
            }

            if (!await _context.Reviews.AnyAsync(r => r.Id == Review2Id))
            {
                var review2 = new Review
                {
                    Id = Review2Id,
                    UserId = userId,
                    ServiceCenterId = Center1Id,
                    BookingId = Booking2Id,
                    Rating = 4,
                    Comment = "Professional brake work, the car feels brand new. Slightly slow on delivery but the quality was worth it.",
                    CreatedAt = now.AddDays(-29),
                    Photos = new List<ReviewPhoto>()
                };

                _context.Reviews.Add(review2);
                await _context.SaveChangesAsync();
            }
        }

        private async Task SeedNotificationsAsync(string userId)
        {
            var now = DateTime.UtcNow;

            var notifications = new List<Notification>
            {
                new Notification
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-e001-000000000001"),
                    UserId = userId,
                    Type = NotificationType.BookingConfirmed,
                    Channel = NotificationChannel.InApp,
                    Content = "Your booking at Toyota Service Center - Sheikh Zayed has been confirmed (Regular 20,000 km service).",
                    IsRead = false,
                    CreatedAt = now.AddDays(-2)
                },
                new Notification
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-e002-000000000001"),
                    UserId = userId,
                    Type = NotificationType.BookingCompleted,
                    Channel = NotificationChannel.InApp,
                    Content = "Your oil change at German Engineering VAG Workshop was completed successfully.",
                    IsRead = true,
                    ReadAt = now.AddDays(-44),
                    CreatedAt = now.AddDays(-45)
                },
                new Notification
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-e003-000000000001"),
                    UserId = userId,
                    Type = NotificationType.BookingPending,
                    Channel = NotificationChannel.InApp,
                    Content = "Your tire replacement booking at Cairo Auto Service Hub is awaiting confirmation.",
                    IsRead = false,
                    CreatedAt = now.AddDays(-1)
                },
                new Notification
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-e004-000000000001"),
                    UserId = userId,
                    Type = NotificationType.MaintenanceReminder,
                    Channel = NotificationChannel.Both,
                    Content = "Reminder: Your Toyota Corolla is due for an oil change at 20,000 km.",
                    IsRead = false,
                    CreatedAt = now.AddDays(-3)
                }
            };

            foreach (var notification in notifications)
            {
                if (await _context.Notifications.AnyAsync(n => n.Id == notification.Id)) continue;
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
        }

        private async Task SeedMileageAndRemindersAsync(string userId)
        {
            var now = DateTime.UtcNow;

            var mileageEntries = new List<MileageEntry>
            {
                new MileageEntry
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-f001-000000000001"),
                    UserId = userId,
                    CarId = Car1Id,
                    Mileage = 16400,
                    Notes = "Initial reading",
                    LoggedAt = now.AddMonths(-6)
                },
                new MileageEntry
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-f001-000000000002"),
                    UserId = userId,
                    CarId = Car1Id,
                    Mileage = 17800,
                    Notes = "After Cairo trip",
                    LoggedAt = now.AddMonths(-3)
                },
                new MileageEntry
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-f001-000000000003"),
                    UserId = userId,
                    CarId = Car1Id,
                    Mileage = 18400,
                    Notes = "City driving",
                    LoggedAt = now.AddDays(-10)
                },
                new MileageEntry
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-f001-000000000004"),
                    UserId = userId,
                    CarId = Car3Id,
                    Mileage = 9600,
                    Notes = "First 10k checkup",
                    LoggedAt = now.AddDays(-5)
                }
            };

            foreach (var entry in mileageEntries)
            {
                if (await _context.MileageEntries.AnyAsync(m => m.Id == entry.Id)) continue;
                _context.MileageEntries.Add(entry);
            }

            var reminders = new List<MaintenanceReminder>
            {
                new MaintenanceReminder
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-ac01-000000000001"),
                    UserId = userId,
                    CarId = Car1Id,
                    Title = "Oil Change",
                    MileageThreshold = 20000,
                    IsTriggered = false,
                    IsActive = true,
                    CreatedAt = now.AddMonths(-2)
                },
                new MaintenanceReminder
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-ac01-000000000002"),
                    UserId = userId,
                    CarId = Car1Id,
                    Title = "Tire Rotation",
                    MileageThreshold = 25000,
                    IsTriggered = false,
                    IsActive = true,
                    CreatedAt = now.AddMonths(-2)
                },
                new MaintenanceReminder
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-ac01-000000000003"),
                    UserId = userId,
                    CarId = Car2Id,
                    Title = "Brake Pads Inspection",
                    MileageThreshold = 35000,
                    IsTriggered = false,
                    IsActive = true,
                    CreatedAt = now.AddMonths(-3)
                }
            };

            foreach (var reminder in reminders)
            {
                if (await _context.MaintenanceReminders.AnyAsync(m => m.Id == reminder.Id)) continue;
                _context.MaintenanceReminders.Add(reminder);
            }

            await _context.SaveChangesAsync();
        }

        private async Task SeedPartReservationsAsync(string userId)
        {
            var now = DateTime.UtcNow;

            var reservations = new List<PartReservation>
            {
                new PartReservation
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-ae01-000000000001"),
                    ClientId = userId,
                    ServiceCenterId = Center2Id,
                    SparePartId = BrakePadsFrontId,
                    Quantity = 2,
                    UnitPrice = 450m,
                    Status = ReservationStatus.PickedUp,
                    ReservedAt = now.AddDays(-31),
                    ExpiresAt = now.AddDays(-24),
                    PickedUpAt = now.AddDays(-30)
                },
                new PartReservation
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-ae01-000000000002"),
                    ClientId = userId,
                    ServiceCenterId = Center2Id,
                    SparePartId = EngineOil5W30Id,
                    Quantity = 3,
                    UnitPrice = 180m,
                    Status = ReservationStatus.Pending,
                    ReservedAt = now.AddDays(-2),
                    ExpiresAt = now.AddDays(5)
                },
                new PartReservation
                {
                    Id = Guid.Parse("db0b0011-cafe-4a11-ae01-000000000003"),
                    ClientId = userId,
                    ServiceCenterId = Center2Id,
                    SparePartId = OilFilterId,
                    Quantity = 1,
                    UnitPrice = 280m,
                    Status = ReservationStatus.Pending,
                    ReservedAt = now.AddDays(-1),
                    ExpiresAt = now.AddDays(6)
                }
            };

            foreach (var reservation in reservations)
            {
                if (await _context.PartReservations.AnyAsync(pr => pr.Id == reservation.Id)) continue;
                _context.PartReservations.Add(reservation);
            }

            await _context.SaveChangesAsync();
        }
    }
}