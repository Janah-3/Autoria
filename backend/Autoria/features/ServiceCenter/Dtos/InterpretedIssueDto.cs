namespace Autoria.Features.ServiceCenters.MatchServiceCenters.Dtos;

public record InterpretedIssueDto(
    string ServiceCenterType,
    string? ServiceType,
    string Urgency
);