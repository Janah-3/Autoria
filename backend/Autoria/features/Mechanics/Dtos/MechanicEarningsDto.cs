namespace Autoria.Features.Mechanics.Dtos
{
    public class MechanicEarningsDto
    {
        public decimal TotalEarnings { get; set; }
        public int CompletedJobsCount { get; set; }
        public DateOnly? From { get; set; }
        public DateOnly? To { get; set; }
    }
}