using Autoria.shared.Enums;
using MediatR;

namespace Autoria.features.ServiceCenter.Commands.UpdateMyServiceCenter
{
    public record UpdateMyServiceCenterCommand(
    string? Name,
    string? Governorate,
    string? District,
    string? StreetAddress,
    string? Phone,
    string? BusinessEmail,
    int? YearEstablished,
    string? Description,
    int? NumServiceBays,
    ServiceCenterType? Type,
    double? Latitude,
    double? Longitude
) : IRequest<Unit>;
}
