using Autoria.shared.Entities;

namespace Autoria.features.ServiceCenter.Entities
{
    public class ServiceCenterServiceType
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter ServiceCenter { get; set; } = default!;
        public Guid ServiceTypeId { get; set; }
        public ServiceType ServiceType { get; set; } = default!;
    }
}
