using Autoria.features.Subscribtion.Dtos;
using MediatR;

namespace Autoria.features.Subscribtion.Queries.GetSubscriptionPlans
{
    public record GetSubscriptionPlansQuery : IRequest<List<SubscriptionPlanInfoDto>>;
}
