using MediatR;

namespace Autoria.features.Reports.Commands.DismissReport
{
    public record DismissReportCommand(
    Guid ReportId,
    string ResolutionNote
     ) : IRequest<Unit>;

    public record DismissReportRequest(string ResolutionNote);

}
