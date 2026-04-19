using Autoria.features.Cars.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Cars.Querys.GetCarsByUserId
{
    public record GetCarsByUserIdQuery(
        Guid UserId,
        int Page = 1,
        int PageSize = 10,
        string? Search = null,
        string? SortBy = null,
        bool IsDescending = false
    ) : IRequest<ApiResponse<PagedResponse<CarDto>>>;
}
