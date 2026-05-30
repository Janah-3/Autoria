namespace Autoria.features.ServiceCenter.Dtos
{
    public class ServiceCenterAnalyticsDto
    {
        // Basic — available to Free plan
        public BasicAnalyticsDto Basic { get; set; } = default!;

        // Advanced — Premium only, null for Free plan
        public AdvancedAnalyticsDto? Advanced { get; set; }
    }

    public class BasicAnalyticsDto
    {
        public int TotalBookings { get; set; }
        public int BookingsThisMonth { get; set; }
        public int BookingsLastMonth { get; set; }
        public int PendingBookings { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
    }

    public class AdvancedAnalyticsDto
    {
        public int ProfileViewsTotal { get; set; }
        public int ProfileViewsThisMonth { get; set; }
        public double ConversionRate { get; set; }          // bookings / profile views %
        public List<ServiceTypeStatDto> TopServices { get; set; } = new();
        public List<PeakDayDto> PeakBookingDays { get; set; } = new();
        public List<MonthlyBookingStatDto> MonthlyTrend { get; set; } = new();
    }

    public class ServiceTypeStatDto
    {
        public string ServiceTypeName { get; set; } = default!;
        public int BookingCount { get; set; }
    }

    public class PeakDayDto
    {
        public string DayOfWeek { get; set; } = default!;
        public int BookingCount { get; set; }
    }

    public class MonthlyBookingStatDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = default!;
        public int BookingCount { get; set; }
        public decimal Revenue { get; set; }
    }
}
