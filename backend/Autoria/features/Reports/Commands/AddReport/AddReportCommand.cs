using System;
using Autoria.features.Reports.Enums;
using Autoria.shared.Enums;
using MediatR;

namespace Autoria.features.Reports.Commands.AddReport
{
    public record AddReportCommand(
     ReportTaregetType TargetType,
     Guid TargetId,
     ReportReason Reason,
     string? Details
 ) : IRequest<Unit>;

}
