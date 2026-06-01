using Autoria.features.Subscribtion.Enums;

namespace Autoria.features.Subscribtion.Dtos
{
    public class SubscriptionPaymentDto
    {
        public Guid SubscriptionId { get; set; }
        public decimal Amount { get; set; }
        public int MonthsDuration { get; set; }
        public SubscriptionStatus Status { get; set; }
        public string Message { get; set; } = default!;
    }
}
