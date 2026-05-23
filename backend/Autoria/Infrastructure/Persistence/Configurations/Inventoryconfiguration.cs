using Autoria.features.Inventory.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations;

public class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.Property(i => i.Price)
            .HasColumnType("decimal(18,2)");

        builder.HasOne(i => i.SparePart)
            .WithMany(sp => sp.Inventories)
            .HasForeignKey(i => i.SparePartId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(i => i.ServiceCenter)
            .WithMany()
            .HasForeignKey(i => i.ServiceCenterId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}