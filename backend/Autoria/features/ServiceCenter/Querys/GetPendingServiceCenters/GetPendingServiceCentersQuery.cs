using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;

namespace Autoria.features.ServiceCenter.Querys.GetPendingServiceCenters
{
    public record GetPendingServiceCentersQuery(
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResponse<PendingServiceCenterDto>>;

    public class PendingServiceCenterDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string OwnerFullName { get; set; }
        public string BusinessEmail { get; set; }
        public string Phone { get; set; }
        public string Governorate { get; set; }
        public string District { get; set; }
        public ServiceCenterType Type { get; set; }
        public ApprovalStatus ApprovalStatus { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
