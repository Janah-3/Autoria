namespace Autoria.features.JobRequests.DTOs
{
    public class JobRequestSummaryDto
    {
        public Guid Id { get; set; }
        public string MechanicName { get; set; } = default!;
        public string MechanicPhoto { get; set; } = default!;
        public string CarInfo { get; set; } = default!;
        public string ProblemDescription { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime? ScheduledAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
