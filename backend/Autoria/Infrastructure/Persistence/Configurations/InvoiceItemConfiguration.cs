using Autoria.features.Payments.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations
{
    public class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
    {
        public void Configure(EntityTypeBuilder<InvoiceItem> builder)
        {
            builder
                .Property(i => i.UnitPrice)
                .HasPrecision(18, 2);

            builder
                .Ignore(i => i.TotalPrice);
        }
    }
}
