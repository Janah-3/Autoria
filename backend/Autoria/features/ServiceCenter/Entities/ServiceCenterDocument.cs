using Autoria.shared.Enums;

namespace Autoria.features.ServiceCenter.Entities
{
    public class ServiceCenterDocument
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter ServiceCenter { get; set; } = default!;
        public DocumentType DocumentType { get; set; }
        public string FileUrl { get; set; } = default!;
        public DateTime UploadedAt { get; set; }
    }
}
