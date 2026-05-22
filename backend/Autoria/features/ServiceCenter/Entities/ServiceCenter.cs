using NetTopologySuite.Geometries;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Enums;

namespace Autoria.features.ServiceCenter.Entities
{
    public class ServiceCenter
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;

        public string Name { get; set; } = default!;
      
        public string Phone { get; set; } = default!;
        public string BusinessEmail { get; set; } = default!;
        public int YearEstablished { get; set; }
        public string Description { get; set; } = default!;
        public string CommercialRegNo { get; set; } = default!;
        public string TaxCardNo { get; set; } = default!;
        public string OwnerNationalId { get; set; } = default!;
        public string OwnerFullName { get; set; } = default!;
        public int NumServiceBays { get; set; }

        public ServiceCenterType Type { get; set; }
        public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;

        public DateTime SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? RejectionReason { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Point? Location { get; set; }
        public string? Address { get; set; }

        public double Rating { get; set; }


        // Navigation properties
        public User User { get; set; } = default!;
        public ICollection<OperatingHours> OperatingHours { get; set; } = new List<OperatingHours>();
        public ICollection<ServiceCenterServiceType> ServiceTypes { get; set; } = new List<ServiceCenterServiceType>();
        public ICollection<ServiceCenterCarBrand> CarBrands { get; set; } = new List<ServiceCenterCarBrand>();
        public ICollection<ServiceCenterDocument> Documents { get; set; } = new List<ServiceCenterDocument>();
        public ICollection<ServiceCenterPhoto> Photos { get; set; } = new List<ServiceCenterPhoto>();
    }
}
