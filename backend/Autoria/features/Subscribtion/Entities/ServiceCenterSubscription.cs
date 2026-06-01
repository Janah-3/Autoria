using Autoria.features.Subscribtion.Enums;

namespace Autoria.features.Subscribtion.Entities
{
    public class ServiceCenterSubscription
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter.Entities.ServiceCenter ServiceCenter { get; set; } = default!;
        public SubscriptionPlan Plan { get; set; } = SubscriptionPlan.Free;
        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.PendingPayment;
        public decimal AmountPaid { get; set; }
        public string? TransactionId { get; set; }
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime EndDate { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
