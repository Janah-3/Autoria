using Autoria.features.Subscribtion.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Autoria.Infrastructure.Persistence.Configurations
{
    public class ServiceCenterSubscriptionconfiguration : IEntityTypeConfiguration<ServiceCenterSubscription>
    {
        public void Configure(EntityTypeBuilder<ServiceCenterSubscription> builder)
        {
            builder.Property(x => x.AmountPaid)
                .HasPrecision(18, 2);
        }
    }
}
