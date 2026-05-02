using Autoria.features.SpareParts.Dtos;
using MediatR;

namespace Autoria.features.SpareParts.Queries.GetSparePartById
{
    public record GetSparePartByIdQuery(Guid SparePartId) : IRequest<SparePartDetailDto>;
}
