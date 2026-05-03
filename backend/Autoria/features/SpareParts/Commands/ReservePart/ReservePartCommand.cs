using MediatR;

namespace Autoria.features.SpareParts.Commands.ReservePart
{
    public record ReservePartCommand(
        Guid ServiceCenterId,
        Guid SparePartId,
        int Quantity,
        Guid? BookingId = null
    ) : IRequest<Guid>;
}
