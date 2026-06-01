using Autoria.features.Subscribtion.Dtos;
using Autoria.features.Subscribtion.Enums;
using MediatR;

namespace Autoria.features.Subscribtion.Queries.GetSubscriptionPlans
{
    public class GetSubscriptionPlansHandler : IRequestHandler<GetSubscriptionPlansQuery, List<SubscriptionPlanInfoDto>>
    {
        public Task<List<SubscriptionPlanInfoDto>> Handle(GetSubscriptionPlansQuery request, CancellationToken cancellationToken)
        {
            var plans = new List<SubscriptionPlanInfoDto>
        {
            new()
            {
                Plan         = SubscriptionPlan.Free,
                Name         = "Free",
                MonthlyPrice = 0,
                Features     = new()
                {
                    "List your service center on Autoria",
                    "Manage bookings (confirm, cancel, complete)",
                    "Manage spare parts inventory",
                    "Receive and reply to reviews",
                    "Basic analytics",
                    "Customer notifications"
                }
            },
            new()
            {
                Plan         = SubscriptionPlan.Premium,
                Name         = "Premium",
                MonthlyPrice = 1300,
                Features     = new()
                {
                    "Everything in Free",
                    "Featured listing — appear at the top of search results",
                    "Send promotional emails to past clients",
                    "Advanced analytics (profile views, conversion rate, top services, peak days)",
                    "Monthly vs last month booking comparison",
                    "Priority support"
                }
            }
        };

            return Task.FromResult(plans);
        }
    }
}
