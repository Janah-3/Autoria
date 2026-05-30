using Autoria.features.Inventory.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations
{
    public class InventoryHistoryConfiguration : IEntityTypeConfiguration<InventoryHistory>
    {
        public void Configure(EntityTypeBuilder<InventoryHistory> builder)
        {
            builder.Property(h => h.NewPrice)
                .HasColumnType("decimal(18,2)");
            builder.Property(h => h.PreviousPrice)
                .HasColumnType("decimal(18,2)");
        }
    }
}
