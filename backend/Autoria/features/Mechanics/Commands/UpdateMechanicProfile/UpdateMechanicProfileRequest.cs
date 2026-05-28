using Microsoft.AspNetCore.Http;

namespace Autoria.Features.Mechanics.Commands.UpdateMechanicProfile
{
    public record UpdateMechanicProfileRequest(
        string? City,
        double? Latitude,
        double? Longitude,
        int? YearsOfExperience,
        IFormFile? ProfilePhoto,
        List<Guid>? SpecializationIds
    );
}