using Autoria.features.Payments.Enums;
using MediatR;

namespace Autoria.features.Payments.Commands.ProcessPayment
{
    public record ProcessPaymentCommand(
        Guid InvoiceId,
        PaymentMethod Method,
        string? CardToken = null   // only required for Card payments
    ) : IRequest<ProcessPaymentResult>;

    public record ProcessPaymentResult(
        bool Success,
        string? TransactionId,
        string? Message
    );
}
