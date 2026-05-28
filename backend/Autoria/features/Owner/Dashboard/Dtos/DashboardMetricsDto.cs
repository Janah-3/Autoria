namespace Autoria.features.Owner.Dashboard.Dtos
{
    public class DashboardMetricsDto
    {
        public int TodayBookingsTotal { get; set; }
        public int TodayConfirmed { get; set; }
        public int TodayPending { get; set; }
        public int PendingRequestsTotal { get; set; }
        public int TotalReviews { get; set; }
        public int NewReviewsThisWeek { get; set; }
        public double AverageRating { get; set; }
    }
}
