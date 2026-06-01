using Autoria.features.Subscribtion.Dtos;
using MediatR;

namespace Autoria.features.Subscribtion.Commands.CreateSubscription
{
    public record CreateSubscriptionCommand(Guid ServiceCenterId) : IRequest<SubscriptionPaymentDto>;

}
