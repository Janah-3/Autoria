using Autoria.features.Subscribtion.Enums;

namespace Autoria.features.Subscribtion.Dtos
{
    public class SubscriptionStatusDto
    {
        public Guid SubscriptionId { get; set; }
        public SubscriptionPlan Plan { get; set; }
        public SubscriptionStatus Status { get; set; }
        public bool IsPremium { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRemaining { get; set; }
    }
}
