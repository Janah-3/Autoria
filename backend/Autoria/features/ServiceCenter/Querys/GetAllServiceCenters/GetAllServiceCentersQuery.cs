using Autoria.features.ServiceCenter.Dtos;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;

public record GetAllServiceCentersQuery(
    int Page,
    int PageSize,
    string? Search,
    ServiceCenterType? Type,
    Guid? ServiceTypeId,
    Guid? CarBrandId,
    double? Latitude,
    double? Longitude,
    string? Governorate,      
    double? MinRating         
) : IRequest<PagedResponse<ServiceCenterSummaryDto>>;