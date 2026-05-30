using MediatR;

namespace Autoria.features.Payments.Commands.ConfirmCashPayment
{
    public record ConfirmCashPaymentCommand(Guid PaymentId) : IRequest;

}
