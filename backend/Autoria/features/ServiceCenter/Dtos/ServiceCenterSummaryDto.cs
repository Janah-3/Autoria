using Autoria.shared.Enums;

namespace Autoria.features.ServiceCenter.Dtos
{
    public class ServiceCenterSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public ServiceCenterType Type { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? CoverPhoto { get; set; }
        public List<string> ServiceTypes { get; set; }
        public List<string> CarBrands { get; set; }
    }
}
