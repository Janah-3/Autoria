using Autoria.Features.ServiceCenters.MatchServiceCenters.Dtos;

namespace Autoria.Features.ServiceCenters.MatchServiceCenters;

public record MatchServiceCentersResult(
    List<MatchedServiceCenterDto> Matches,
    InterpretedIssueDto InterpretedIssue
);