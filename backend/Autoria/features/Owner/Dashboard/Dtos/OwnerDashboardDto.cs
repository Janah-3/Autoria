namespace Autoria.features.Owner.Dashboard.Dtos
{
    public class OwnerDashboardDto
    {
        public DashboardMetricsDto Metrics { get; set; } = default!;
        public List<TodayAppointmentDto> TodayAppointments { get; set; } = new();
        public List<ActivityItemDto> RecentActivity { get; set; } = new();
        public bool IsOpenToday { get; set; }
    }
}
