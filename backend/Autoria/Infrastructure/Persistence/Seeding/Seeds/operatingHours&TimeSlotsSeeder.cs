using Autoria.features.Booking.Entities;
using Autoria.features.ServiceCenter.Entities;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class operatingHours_TimeSlotsSeeder
    {
        
            private readonly AppDbContext _context;
            private static readonly Guid ServiceCenterId = Guid.Parse("BB22CC33-44DD-55EE-66FF-77AA88BB99CC");

            public operatingHours_TimeSlotsSeeder(AppDbContext context)
            {
                _context = context;
            }

            public async Task SeedAsync()
            {
                await SeedOperatingHoursAsync();
                await SeedTimeSlotsAsync();
            }

            // ─── Operating Hours ──────────────────────────────────────────────────────

            private async Task SeedOperatingHoursAsync()
            {
                if (await _context.OperatingHours.AnyAsync(oh => oh.ServiceCenterId == ServiceCenterId))
                    return;

                var hours = new List<OperatingHours>
        {
            new OperatingHours
            {
                Id = Guid.NewGuid(), ServiceCenterId = ServiceCenterId,
                Day = DayOfWeek.Sunday,
                OpenTime = default, CloseTime = default,
                IsClosed = true
            },
            new OperatingHours
            {
                Id = Guid.NewGuid(), ServiceCenterId = ServiceCenterId,
                Day = DayOfWeek.Monday,
                OpenTime = new TimeOnly(12, 0), CloseTime = new TimeOnly(21, 0),
                IsClosed = false
            },
            new OperatingHours
            {
                Id = Guid.NewGuid(), ServiceCenterId = ServiceCenterId,
                Day = DayOfWeek.Tuesday,
                OpenTime = new TimeOnly(12, 0), CloseTime = new TimeOnly(21, 0),
                IsClosed = false
            },
            new OperatingHours
            {
                Id = Guid.NewGuid(), ServiceCenterId = ServiceCenterId,
                Day = DayOfWeek.Wednesday,
                OpenTime = new TimeOnly(12, 0), CloseTime = new TimeOnly(21, 0),
                IsClosed = false
            },
            new OperatingHours
            {
                Id = Guid.NewGuid(), ServiceCenterId = ServiceCenterId,
                Day = DayOfWeek.Thursday,
                OpenTime = new TimeOnly(12, 0), CloseTime = new TimeOnly(21, 0),
                IsClosed = false
            },
            new OperatingHours
            {
                Id = Guid.NewGuid(), ServiceCenterId = ServiceCenterId,
                Day = DayOfWeek.Friday,
                OpenTime = new TimeOnly(12, 0), CloseTime = new TimeOnly(21, 0),
                IsClosed = false
            },
            new OperatingHours
            {
                Id = Guid.NewGuid(), ServiceCenterId = ServiceCenterId,
                Day = DayOfWeek.Saturday,
                OpenTime = new TimeOnly(12, 0), CloseTime = new TimeOnly(21, 0),
                IsClosed = false
            },
        };

                await _context.OperatingHours.AddRangeAsync(hours);
                await _context.SaveChangesAsync();
            }

            // ─── Time Slots ───────────────────────────────────────────────────────────

            private async Task SeedTimeSlotsAsync()
            {
                if (await _context.TimeSlots.AnyAsync(ts => ts.ServiceCenterId == ServiceCenterId))
                    return;

                var slots = new List<TimeSlot>();
                var today = DateOnly.FromDateTime(DateTime.UtcNow);

                for (int day = 0; day < 30; day++)
                {
                    var date = today.AddDays(day);

                    // Skip Sunday
                    if (date.DayOfWeek == DayOfWeek.Sunday)
                        continue;

                    // 12:00 PM to 9:00 PM — 9 slots (12,13,14,15,16,17,18,19,20)
                    for (int hour = 12; hour < 21; hour++)
                    {
                        slots.Add(new TimeSlot
                        {
                            Id = Guid.NewGuid(),
                            ServiceCenterId = ServiceCenterId,
                            Date = date,
                            StartTime = new TimeOnly(hour, 0),
                            EndTime = new TimeOnly(hour + 1, 0),
                            IsBlocked = false,
                            IsBooked = false,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                await _context.TimeSlots.AddRangeAsync(slots);
                await _context.SaveChangesAsync();
            
        }
    }
}
