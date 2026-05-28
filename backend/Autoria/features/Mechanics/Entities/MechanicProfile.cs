using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Enums;
using NetTopologySuite.Geometries;

namespace Autoria.Features.Mechanics.Entities
{
    public class MechanicProfile
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
        public int YearsOfExperience { get; set; }
        public string NationalIdUrl { get; set; } = default!;
        public string ProfilePhotoUrl { get; set; } = default!;
        public string City { get; set; } = default!;
        public Point? Location { get; set; }
        public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public double Rating { get; set; }

        // Navigation
        public User User { get; set; } = default!;
        public ICollection<MechanicSpecialization> Specializations { get; set; } = [];
    }
}