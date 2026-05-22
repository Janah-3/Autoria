namespace Autoria.features.Admin.Dashboard.Dtos
{
    public class DashboardMetricsDto
    {
        public int TotalUsers { get; set; }
        public int bookingsThisMonth { get; set; }
        public int activeCenters { get; set; }
        public double avgServiceCenterRating { get; set; }

    }
}
