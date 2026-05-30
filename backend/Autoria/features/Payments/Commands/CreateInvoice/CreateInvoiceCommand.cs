using MediatR;

namespace Autoria.features.Payments.Commands.CreateInvoice
{
    public record InvoiceItemRequest(string Description, decimal UnitPrice, int Quantity);

    public record CreateInvoiceCommand(
        Guid BookingId,
        List<InvoiceItemRequest> Items,
        string? Notes
    ) : IRequest<Guid>;
}
