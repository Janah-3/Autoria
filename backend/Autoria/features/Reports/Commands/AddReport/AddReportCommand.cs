using System;
using Autoria.features.Reports.Enums;
using Autoria.shared.Enums;
using MediatR;

namespace Autoria.features.Reports.Commands.AddReport
{
    public record AddReportCommand(

     AdminTargetType TargetType ,  
     string TargetId,
     string Reason ,
     ReportStatus Status,
     Guid? ReviewedBy ,
     DateTime CreatedAt,
     DateTime? ReviewedAt 
        ):IRequest<Unit>;
    
}
