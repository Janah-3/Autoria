using Autoria.features.Payments.Enums;
using MediatR;

namespace Autoria.features.Subscribtion.Commands.PaySubscription
{
    public record PaySubscriptionCommand(
        Guid SubscriptionId,
        PaymentMethod Method,
        string? CardToken = null
    ) : IRequest<PaySubscriptionResult>;

    public record PaySubscriptionResult(
        bool Success,
        string? TransactionId,
        string Message
    );
}
