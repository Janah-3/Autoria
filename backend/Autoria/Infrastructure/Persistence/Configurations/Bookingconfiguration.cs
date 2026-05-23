using Autoria.features.Booking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.Property(b => b.TotalPrice)
            .HasPrecision(18, 2);

        builder.HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(b => b.ServiceCenter)
            .WithMany()
            .HasForeignKey(b => b.ServiceCenterId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(b => b.TimeSlot)
            .WithOne(ts => ts.Booking)
            .HasForeignKey<Booking>(b => b.TimeSlotId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}