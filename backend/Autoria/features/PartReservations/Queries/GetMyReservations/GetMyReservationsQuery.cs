using Autoria.features.PartReservations.Dtos;
using Autoria.features.PartReservations.Enums;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.PartReservations.Queries.GetMyReservations
{
    public record GetMyReservationsQuery(
        ReservationStatus? Status,
        int Page,
        int PageSize
    ) : IRequest<PagedResponse<ReservationDto>>;
}