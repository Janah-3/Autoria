using Autoria.features.Subscribtion.Enums;

namespace Autoria.features.Subscribtion.Dtos
{
    public class SubscriptionPlanInfoDto
    {
        public SubscriptionPlan Plan { get; set; }
        public string Name { get; set; } = default!;
        public decimal MonthlyPrice { get; set; }
        public List<string> Features { get; set; } = new();
    }

}
