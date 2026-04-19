namespace Autoria.features.ServiceCenter.Entities
{

    public class ServiceCenterPhoto
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter ServiceCenter { get; set; } = default!;
        public string PhotoUrl { get; set; } = default!;
        public DateTime UploadedAt { get; set; }
    }
}
