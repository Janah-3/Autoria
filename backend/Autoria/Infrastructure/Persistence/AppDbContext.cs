using System.Reflection;
using System.Reflection.Emit;
using Autoria.features.Booking.Entities;
using Autoria.features.Car.Entity;
using Autoria.features.Inventory.Entities;
using Autoria.features.Notifications.Entities;
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
        public AppDbContext(DbContextOptions<AppDbContext> options):base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
           
            builder.Entity<IdentityRole>().ToTable("Roles");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
            builder.Entity<User>().ToTable("users");
            builder.Entity<RefreshToken>().ToTable("RefreshTokens");

            builder.Entity<Car>()
                .HasOne(c => c.User)
                .WithMany(u => u.Cars)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<ServiceCenter>()
                .HasOne(sc => sc.User)
                .WithMany()
                .HasForeignKey(sc => sc.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<SparePart>()
                .HasOne(sp => sp.CreatedBy)
                .WithMany()
                .HasForeignKey(sp => sp.CreatedById)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Booking>()
                .HasOne(b => b.ServiceCenter)
                .WithMany()
                .HasForeignKey(b => b.ServiceCenterId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Booking>()
                .Property(b => b.TotalPrice)
                .HasPrecision(18, 2);

            builder.Entity<Booking>()
                .HasOne(b => b.TimeSlot)
                .WithOne(ts => ts.Booking)
                .HasForeignKey<Booking>(b => b.TimeSlotId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Review>()
                .HasOne(r => r.ServiceCenter)
                .WithMany()
                .HasForeignKey(r => r.ServiceCenterId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Inventory>()
                .Property(i => i.Price)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Inventory>()
                .HasOne(i => i.SparePart)
                .WithMany(sp => sp.Inventories)
                .HasForeignKey(i => i.SparePartId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Inventory>()
                .HasOne(i => i.ServiceCenter)
                .WithMany()
                .HasForeignKey(i => i.ServiceCenterId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<InventoryHistory>()
                .Property(h => h.NewPrice).HasColumnType("decimal(18,2)");

            builder.Entity<InventoryHistory>()
                .Property(h => h.PreviousPrice).HasColumnType("decimal(18,2)");


            builder.Entity<PartReservation>()
    .HasOne(pr => pr.Client)
    .WithMany()
    .HasForeignKey(pr => pr.ClientId)
    .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<PartReservation>()
                .HasOne(pr => pr.ServiceCenter)
                .WithMany()
                .HasForeignKey(pr => pr.ServiceCenterId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<PartReservation>()
                .HasOne(pr => pr.SparePart)
                .WithMany()
                .HasForeignKey(pr => pr.SparePartId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<PartReservation>()
                .HasOne<Booking>()
                .WithMany()
                .HasForeignKey(pr => pr.BookingId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction);
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
