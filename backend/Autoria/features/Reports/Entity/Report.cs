using System;
using Autoria.features.Reports.Enums;

namespace Autoria.features.Reports.Entity
{
    public class Report
    {
        public Guid Id { get; set; }                 

        public Guid ReporterId { get; set; }         

        public string TargetType { get; set; }      

        public Guid TargetId { get; set; }           

        public string Reason { get; set; }

        public string Details { get; set; }

        public ReportStatus Status { get; set; }           // e.g., "pending", "reviewed"

        public Guid? ReviewedBy { get; set; }        // FK (nullable until reviewed)

        public DateTime CreatedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }    // nullable until reviewed
    }
}
