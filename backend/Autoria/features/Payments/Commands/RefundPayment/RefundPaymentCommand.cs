using MediatR;

namespace Autoria.features.Payments.Commands.RefundPayment
{
    public record RefundPaymentCommand(
        Guid PaymentId,
        string Reason
    ) : IRequest;
}
