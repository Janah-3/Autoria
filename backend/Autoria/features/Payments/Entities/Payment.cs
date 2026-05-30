using Autoria.features.Payments.Enums;
using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.Payments.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string UserId { get; set; } = default!;
        public User User { get; set; } = default!;
        public Guid InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = default!;
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        public decimal Amount { get; set; }
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
        public string? RefundReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
        public DateTime? RefundedAt { get; set; }
    }
}
