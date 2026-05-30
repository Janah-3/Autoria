using MediatR;

namespace Autoria.features.Subscribtion.Commands.CreateSubscription
{
    public record CreateSubscriptionCommand(
        Guid ServiceCenterId,
        int MonthsDuration   // 1, 3, 6, 12
    ) : IRequest<Guid>;

}
