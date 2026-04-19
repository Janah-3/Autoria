namespace Autoria.features.ServiceCenter.Entities
{

    public class ServiceCenterCarBrand
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter ServiceCenter { get; set; } = default!;
        public Guid CarBrandId { get; set; }
        public CarBrand CarBrand { get; set; } = default!;
    }

}
