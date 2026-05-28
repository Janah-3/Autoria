using Autoria.Features.Mechanics.Entities;
using Autoria.shared.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Features.Mechanics.Configurations
{
    public class MechanicProfileConfiguration : IEntityTypeConfiguration<MechanicProfile>
    {
        public void Configure(EntityTypeBuilder<MechanicProfile> builder)
        {
            builder.ToTable("MECHANIC_PROFILES");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.NationalIdUrl).IsRequired();
            builder.Property(x => x.ProfilePhotoUrl).IsRequired();
            builder.Property(x => x.City).IsRequired().HasMaxLength(100);
            builder.Property(x => x.ApprovalStatus)
                .HasConversion<string>()
                .IsRequired();
            builder.Property(x => x.RejectionReason).HasMaxLength(500);
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.Rating).HasDefaultValue(0.0);

            builder.HasOne(x => x.User)
                .WithOne()
                .HasForeignKey<MechanicProfile>(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}