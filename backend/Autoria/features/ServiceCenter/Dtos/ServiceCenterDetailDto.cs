using Autoria.shared.Enums;

namespace Autoria.features.ServiceCenter.Dtos
{
    public class ServiceCenterDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Governorate { get; set; }
        public string District { get; set; }
        public string StreetAddress { get; set; }
        public string Phone { get; set; }
        public string BusinessEmail { get; set; }
        public int YearEstablished { get; set; }
        public string Description { get; set; }
        public string CommercialRegNo { get; set; }
        public string TaxCardNo { get; set; }
        public string OwnerNationalId { get; set; }
        public string OwnerFullName { get; set; }
        public int NumServiceBays { get; set; }
        public ServiceCenterType Type { get; set; }
        public ApprovalStatus ApprovalStatus { get; set; }
        public string? RejectionReason { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Photos { get; set; }
        public string? CoverPhoto { get; set; }
        public List<string> ServiceTypes { get; set; }
        public List<string> CarBrands { get; set; }
        public List<OperatingHoursDto> OperatingHours { get; set; }
        public List<DocumentDto> Documents { get; set; }
    }

   

   
}
