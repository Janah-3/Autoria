using Autoria.Features.Mechanics.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Features.Mechanics.Configurations
{
    public class MechanicSpecializationConfiguration
        : IEntityTypeConfiguration<MechanicSpecialization>
    {
        public void Configure(EntityTypeBuilder<MechanicSpecialization> builder)
        {

            builder.HasKey(x => new
            {
                x.MechanicProfileId,
                x.ServiceTypeId
            });

            builder.HasOne(x => x.MechanicProfile)
                .WithMany(x => x.Specializations)
                .HasForeignKey(x => x.MechanicProfileId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.ServiceType)
                .WithMany()
                .HasForeignKey(x => x.ServiceTypeId)
                .HasPrincipalKey(x => x.ServiceTypeId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}