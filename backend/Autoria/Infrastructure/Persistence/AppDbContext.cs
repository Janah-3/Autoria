using Autoria.Infrastructure.Identity.entities;
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

    }
}
