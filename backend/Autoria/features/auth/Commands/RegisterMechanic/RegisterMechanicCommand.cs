using Autoria.features.auth.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Autoria.features.auth.Commands.RegisterMechanic
{
    public record RegisterMechanicCommand(
        string FullName,
        string Email,
        string Password,
        string ConfirmPassword,
        string PhoneNumber,
        int YearsOfExperience,
        string City,
        double Latitude,
        double Longitude,
        IFormFile ProfilePhoto,
        IFormFile NationalId,
        List<Guid> SpecializationIds
    ) : IRequest<AuthResponseDto>;
}