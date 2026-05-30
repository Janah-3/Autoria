namespace Autoria.features.Subscribtion.Entities
{
    public class ServiceCenterSubscription
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter.Entities.ServiceCenter ServiceCenter { get; set; } = default!;
        public Enums.SubscriptionPlan Plan { get; set; } = Enums.SubscriptionPlan.Free;
        public Enums.SubscriptionStatus Status { get; set; } = Enums.SubscriptionStatus.Active;
        public decimal AmountPaid { get; set; }
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime EndDate { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
