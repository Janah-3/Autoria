namespace Autoria.Features.Admin.Dashboard.Dtos;

public record PendingApprovalDto(
    Guid ServiceCenterId,
    string Name,
    string OwnerName,
    string City,
    DateTime SubmittedAt
);