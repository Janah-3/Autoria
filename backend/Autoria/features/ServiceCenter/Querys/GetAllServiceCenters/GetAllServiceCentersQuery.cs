using Autoria.features.ServiceCenter.Dtos;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;

namespace Autoria.features.ServiceCenter.Querys.GetAllServiceCenters
{
    public record GetAllServiceCentersQuery(
       int Page,
       int PageSize,
       string? Search,
       ServiceCenterType? Type,
       Guid? ServiceTypeId,
       Guid? CarBrandId,
       double? Latitude,
       double? Longitude
   ) : IRequest<PagedResponse<ServiceCenterSummaryDto>>;


}
