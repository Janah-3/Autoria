using Autoria.features.Cars.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Cars.Querys.GetAllCars
{
    public record GetAllCarsQuery(
        int Page = 1,
        int PageSize = 10,
        string? Search = null,
        string? SortBy = null,
        bool IsDescending = false
    ) : IRequest<ApiResponse<PagedResponse<CarDto>>>;

}
