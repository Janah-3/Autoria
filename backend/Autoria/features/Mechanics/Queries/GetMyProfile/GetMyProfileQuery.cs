using Autoria.features.Mechanics.Dtos;
using MediatR;

namespace Autoria.features.Mechanics.Queries.GetMyProfile
{
    public record GetMyProfileQuery():IRequest<mechanicPersonalProfile>;
    
}
