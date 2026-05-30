using Autoria.features.Payments.Enums;

namespace Autoria.features.Payments.Dtos
{
    public class PaymentDto
    {
        public Guid Id { get; set; }
        public Guid InvoiceId { get; set; }
        public Guid BookingId { get; set; }
        public string UserId { get; set; } = default!;
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; }
        public decimal Amount { get; set; }
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
        public string? RefundReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? RefundedAt { get; set; }
    }
}
