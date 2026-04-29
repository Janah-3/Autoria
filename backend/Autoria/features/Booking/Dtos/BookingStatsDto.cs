namespace Autoria.features.Booking.Dtos
{
    public class BookingStatsDto
    {
        public int TotalBookings { get; set; }
        public int PendingCount { get; set; }
        public int ConfirmedCount { get; set; }
        public int CompletedCount { get; set; }
        public int CancelledCount { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageBookingValue { get; set; }
        public List<DailyBookingStatDto> DailyStats { get; set; } = new();
    }

    public class DailyBookingStatDto
    {
        public DateOnly Date { get; set; }
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }

}
