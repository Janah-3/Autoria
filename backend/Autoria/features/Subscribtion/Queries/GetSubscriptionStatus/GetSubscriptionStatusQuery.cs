using Autoria.features.Subscribtion.Dtos;
using MediatR;

namespace Autoria.features.Subscribtion.Queries.GetSubscriptionStatus
{
    public record GetSubscriptionStatusQuery(Guid ServiceCenterId) : IRequest<SubscriptionStatusDto>;
}
