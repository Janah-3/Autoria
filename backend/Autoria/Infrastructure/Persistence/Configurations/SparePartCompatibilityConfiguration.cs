using Autoria.features.SpareParts.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations
{
    public class SparePartCompatibilityConfiguration
        : IEntityTypeConfiguration<SparePartCompatibility>
    {
        public void Configure(EntityTypeBuilder<SparePartCompatibility> builder)
        {
            builder.HasOne(c => c.SparePart)
                .WithMany(sp => sp.Compatibilities)
                .HasForeignKey(c => c.SparePartId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
