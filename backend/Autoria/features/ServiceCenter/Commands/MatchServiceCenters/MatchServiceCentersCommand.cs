using MediatR;

namespace Autoria.Features.ServiceCenters.MatchServiceCenters;

public record MatchServiceCentersCommand(
    string Issue,
    double Latitude,
    double Longitude,
    Guid? CarId,
    double RadiusKm = 10
) : IRequest<MatchServiceCentersResult>;