using System.Reflection;
using System.Reflection.Emit;
using Autoria.features.Booking.Entities;
using Autoria.features.Car.Entity;
using Autoria.features.Inventory.Entities;
using Autoria.features.Notifications.Entities;
using Autoria.features.PartReservations.Entities;
using Autoria.features.Reports.Entity;
using Autoria.features.Reviews.Entity;
using Autoria.features.ServiceCenter.Entities;
using Autoria.features.SpareParts.Entities;
using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Infrastructure.Persistence
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options):base(options){}

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
           
            builder.Entity<IdentityRole>().ToTable("Roles");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
            builder.Entity<User>().ToTable("users");
            builder.Entity<RefreshToken>().ToTable("RefreshTokens");
            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }

        public DbSet<RefreshToken> RefreshTokens { get; set; } = default!;
        public DbSet<AdminLog> AdminLogs { get; set; } = default!;
        public DbSet<Car>  Cars { get; set; } = default!;
        public DbSet<ServiceCenter> ServiceCenters { get; set; }
        public DbSet<ServiceCenterDocument> ServiceCenterDocuments { get; set; }
        public DbSet<ServiceCenterServiceType> ServiceCenterServiceTypes { get; set; }
        public DbSet<ServiceCenterCarBrand> ServiceCenterCarBrands { get; set; }
        public DbSet<ServiceCenterPhoto> ServiceCenterPhotos { get; set; }
        public DbSet<OperatingHours> OperatingHours { get; set; }
        public DbSet<ServiceType> ServiceTypes { get; set; }
        public DbSet<CarBrand> CarBrands { get; set; }
       public DbSet<ServiceType> serviceTypes { get; set; }
        public DbSet<Booking> Bookings { get; set; } 
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewReply> ReviewReplies { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SparePart> SpareParts { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<PartReservation> PartReservations { get; set; }
        public DbSet<SparePartImage> SparePartImages { get; set; }
        public DbSet<InventoryHistory> InventoryHistories { get; set; }

    }
}
