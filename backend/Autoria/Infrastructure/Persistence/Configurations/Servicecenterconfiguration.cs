using Autoria.features.ServiceCenter.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations;

public class ServiceCenterConfiguration : IEntityTypeConfiguration<ServiceCenter>
{
    public void Configure(EntityTypeBuilder<ServiceCenter> builder)
    {
        builder.HasOne(sc => sc.User)
            .WithMany()
            .HasForeignKey(sc => sc.UserId)
            .OnDelete(DeleteBehavior.NoAction);
        builder.Property(x => x.District)
       .IsRequired(false);

        builder.Property(x => x.Gvernorate)
               .IsRequired(false);

        builder.Property(x => x.Address)
               .IsRequired(false);
    }
}