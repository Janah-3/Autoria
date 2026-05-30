namespace Autoria.features.Payments.Dtos
{
    public class RevenueStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal CardRevenue { get; set; }
        public decimal CashRevenue { get; set; }
        public decimal TotalRefunded { get; set; }
        public decimal NetRevenue { get; set; }
        public int TotalTransactions { get; set; }
        public int CompletedCount { get; set; }
        public int PendingCount { get; set; }
        public int RefundedCount { get; set; }
        public int FailedCount { get; set; }
        public List<DailyRevenueDto> DailyBreakdown { get; set; } = new();
    }

    public class DailyRevenueDto
    {
        public DateOnly Date { get; set; }
        public decimal Revenue { get; set; }
        public int TransactionCount { get; set; }
    }
}
