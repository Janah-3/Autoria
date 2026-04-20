using Autoria.features.ServiceCenter.Dtos;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;

namespace Autoria.features.ServiceCenter.Querys.GetAllServiceCenters
{
    public record GetAllServiceCentersQuery(
    string? Search,
    string? Governorate,
    string? District,
    ServiceCenterType? Type,
    Guid? ServiceTypeId,
    Guid? CarBrandId,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResponse<ServiceCenterSummaryDto>>;

   
}
