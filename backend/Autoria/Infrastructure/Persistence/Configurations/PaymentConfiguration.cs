using Autoria.features.Payments.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.Property(p => p.Amount)
              .HasPrecision(18, 2);

            builder.HasOne(p => p.User)
              .WithMany()
              .HasForeignKey(p => p.UserId)
              .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
