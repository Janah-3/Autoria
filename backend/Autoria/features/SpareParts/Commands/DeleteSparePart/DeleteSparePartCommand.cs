using MediatR;

namespace Autoria.features.SpareParts.Commands.DeleteSparePart
{
    public record DeleteSparePartCommand(Guid SparePartId) : IRequest;
}
