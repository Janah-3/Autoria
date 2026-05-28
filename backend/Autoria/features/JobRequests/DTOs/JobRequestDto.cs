namespace Autoria.features.JobRequests.DTOs
{
    public class JobRequestDto
    {
        public Guid Id { get; set; }
        public string CarOwnerName { get; set; } = default!;
        public string CarOwnerPhone { get; set; } = default!;
        public string MechanicName { get; set; } = default!;
        public string MechanicPhoto { get; set; } = default!;
        public string CarInfo { get; set; } = default!;
        public string ProblemDescription { get; set; } = default!;
        public string LocationAddress { get; set; } = default!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Status { get; set; } = default!;
        public string? CancellationReason { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal? Price { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
