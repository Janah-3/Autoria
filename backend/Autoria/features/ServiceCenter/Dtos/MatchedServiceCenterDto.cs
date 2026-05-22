namespace Autoria.Features.ServiceCenters.MatchServiceCenters.Dtos;

public record MatchedServiceCenterDto(
    Guid ServiceCenterId,
    string Name,
    double DistanceKm,
    double Rating,
    List<string> ServiceTypes,
    string Explanation
);