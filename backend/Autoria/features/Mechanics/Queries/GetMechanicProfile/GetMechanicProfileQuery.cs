
using Autoria.Features.Mechanics.Dtos;
using MediatR;

namespace Autoria.Features.Mechanics.Queries.GetMechanicProfile
{
    public record GetMechanicProfileQuery(Guid MechanicId) : IRequest<MechanicProfileDto>;
}