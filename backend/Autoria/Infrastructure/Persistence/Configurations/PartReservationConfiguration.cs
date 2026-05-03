namespace Autoria.Infrastructure.Persistence.Configurations
{
    using global::Autoria.features.Booking.Entities;
    using global::Autoria.features.SpareParts.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    namespace Autoria.Infrastructure.Persistence.Configurations
    {
        public class PartReservationConfiguration : IEntityTypeConfiguration<PartReservation>
        {
            public void Configure(EntityTypeBuilder<PartReservation> builder)
            {
                builder.HasKey(pr => pr.Id);

                builder.Property(pr => pr.UnitPrice)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                builder.Property(pr => pr.Quantity)
                    .IsRequired();

                builder.Ignore(pr => pr.TotalPrice);

                builder.Property(pr => pr.Status)
                    .HasConversion<string>()
                    .IsRequired();

                builder.Property(pr => pr.CancellationReason)
                    .HasMaxLength(500);

                builder.HasOne(pr => pr.Client)
                    .WithMany()
                    .HasForeignKey(pr => pr.ClientId)
                    .OnDelete(DeleteBehavior.NoAction);

                builder.HasOne(pr => pr.ServiceCenter)
                    .WithMany()
                    .HasForeignKey(pr => pr.ServiceCenterId)
                    .OnDelete(DeleteBehavior.NoAction);

                builder.HasOne(pr => pr.SparePart)
                    .WithMany()
                    .HasForeignKey(pr => pr.SparePartId)
                    .OnDelete(DeleteBehavior.NoAction);

                builder.HasOne<Booking>()
                    .WithMany()
                    .HasForeignKey(pr => pr.BookingId)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.NoAction);
            }
        }
    }
}
