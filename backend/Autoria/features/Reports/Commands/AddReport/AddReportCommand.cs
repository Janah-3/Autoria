using System;
using Autoria.features.Reports.Enums;
using MediatR;

namespace Autoria.features.Reports.Commands.AddReport
{
    public record AddReportCommand(

 

     string TargetType ,    // e.g., "post", "user", etc.

    public Guid TargetId { get; set; }           // ID of the reported entity

    public string Reason { get; set; }

    public string Details { get; set; }

    public ReportStatus Status { get; set; }           // e.g., "pending", "reviewed"

    public Guid? ReviewedBy { get; set; }        // FK (nullable until reviewed)

    public DateTime CreatedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }    // nullable until reviewed
        ):irequest<Unit>;
    
}
