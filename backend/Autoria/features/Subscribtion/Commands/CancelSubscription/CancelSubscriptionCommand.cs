using MediatR;

namespace Autoria.features.Subscribtion.Commands.CancelSubscription
{
    public record CancelSubscriptionCommand(
        Guid ServiceCenterId,
        string? CancellationReason
    ) : IRequest;
}
