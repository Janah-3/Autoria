using Autoria.features.SpareParts.Dtos;
using Autoria.features.SpareParts.Enums;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.SpareParts.Queries.GetUserReservations
{
    public record GetUserReservationsQuery(
        ReservationStatus? Status = null,
        int Page = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<ReservationDto>>;
}
