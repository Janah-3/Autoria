using Autoria.features.SpareParts.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations;

public class SparePartConfiguration : IEntityTypeConfiguration<SparePart>
{
    public void Configure(EntityTypeBuilder<SparePart> builder)
    {
        builder.HasOne(sp => sp.CreatedBy)
            .WithMany()
            .HasForeignKey(sp => sp.CreatedById)
            .OnDelete(DeleteBehavior.NoAction);
    }
}