using Autoria.features.Car.Entity;
using Autoria.features.ServiceCenter.Entities;
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
            builder.Entity<User>().Ignore(u => u.UserName);
            builder.Entity<RefreshToken>().ToTable("RefreshTokens");

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

    }
}
