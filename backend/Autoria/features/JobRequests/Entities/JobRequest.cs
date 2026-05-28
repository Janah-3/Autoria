using Autoria.features.Car.Entity;
using Autoria.features.JobRequests.Enums;
using Autoria.Features.Mechanics.Entities;
using Autoria.Infrastructure.Identity.entities;

namespace Autoria.Features.JobRequests.Entities
{
    public class JobRequest
    {
        public Guid Id { get; set; }
        public string CarOwnerId { get; set; } = default!;
        public Guid MechanicId { get; set; }
        public Guid CarId { get; set; }
        public string ProblemDescription { get; set; } = default!;
        public string LocationAddress { get; set; } = default!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Status { get; set; } = JobRequestStatus.Pending;
        public string? CancellationReason { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal? Price { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation
        public User CarOwner { get; set; } = default!;
        public MechanicProfile Mechanic { get; set; } = default!;
        public Car Car { get; set; } = default!;
    }
}