namespace Autoria.Infrastructure.AI.Models
{
    public record ServiceIssueIntent(
   string ServiceCenterType,
    string? ServiceType,
     string Urgency,
    List<string> Keywords
);
}
