using System;
using Autoria.features.Reports.Enums;
using MediatR;

namespace Autoria.features.Reports.Commands.AddReport
{
    public record AddReportCommand(
        string TargetType,        // e.g., "post", "user"
        Guid TargetId,
        string Reason,
        string Details,
        ReportStatus Status,
        Guid? ReviewedBy,
        DateTime CreatedAt,
        DateTime? ReviewedAt
    ) : IRequest<Unit>;

}
