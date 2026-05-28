using Autoria.Features.JobRequests.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Features.JobRequests.Configurations
{
    public class JobRequestConfiguration : IEntityTypeConfiguration<JobRequest>
    {
        public void Configure(EntityTypeBuilder<JobRequest> builder)
        {
            builder.ToTable("JOB_REQUESTS");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.CarOwnerId).IsRequired();
            builder.Property(x => x.ProblemDescription).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.LocationAddress).IsRequired().HasMaxLength(500);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);
            builder.Property(x => x.CancellationReason).HasMaxLength(500);
            builder.Property(x => x.RejectionReason).HasMaxLength(500);
            builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
            builder.Property(x => x.CreatedAt).IsRequired();

            builder.HasOne(x => x.CarOwner)
                .WithMany()
                .HasForeignKey(x => x.CarOwnerId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.Mechanic)
                .WithMany()
                .HasForeignKey(x => x.MechanicId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.Car)
                .WithMany()
                .HasForeignKey(x => x.CarId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}