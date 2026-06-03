using Autoria.features.Payments.Enums;
using MediatR;

namespace Autoria.features.Subscribtion.Commands.PaySubscription
{
    public record PaySubscriptionCommand(
        Guid SubscriptionId,
        string CardToken
    ) : IRequest<PaySubscriptionResult>;

    public record PaySubscriptionResult(
        bool Success,
        string? TransactionId,
        string Message
    );
}
