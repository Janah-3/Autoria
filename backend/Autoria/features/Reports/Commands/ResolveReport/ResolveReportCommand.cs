using MediatR;

namespace Autoria.features.Reports.Commands.ResolveReport
{
    public record ResolveReportCommand(
      Guid ReportId,
      string ResolutionNote
  ) : IRequest<Unit>;

    public record ResolveReportRequest(string ResolutionNote);
}
