namespace Autoria.features.Payments.Services
{
    public class MockPaymentResult
    {
        public bool Success { get; set; }
        public string TransactionId { get; set; } = default!;
        public string? FailureReason { get; set; }
    }
}
