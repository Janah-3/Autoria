using Autoria.Features.Mechanics.Dtos;
using MediatR;

namespace Autoria.Features.Mechanics.Queries.GetMechanicEarnings
{
    public record GetMechanicEarningsQuery(
        DateOnly? From,
        DateOnly? To
    ) : IRequest<MechanicEarningsDto>;
}