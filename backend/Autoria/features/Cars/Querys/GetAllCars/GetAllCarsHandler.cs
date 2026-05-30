using System.Security.Claims;
using Autoria.features.Cars.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Cars.Querys.GetAllCars
{
    public class GetAllCarsHandler
        : IRequestHandler<GetAllCarsQuery, ApiResponse<PagedResponse<CarDto>>>
    {
        private readonly AppDbContext _dbContext;
        private readonly IHttpContextAccessor _contextAccessor;

        public GetAllCarsHandler(AppDbContext dbContext, IHttpContextAccessor contextAccessor)
        {
            _dbContext = dbContext;
            _contextAccessor = contextAccessor;
        }

        public async Task<ApiResponse<PagedResponse<CarDto>>> Handle(
            GetAllCarsQuery request,
            CancellationToken cancellationToken)
        {
            var user = _contextAccessor.HttpContext?.User
                ?? throw new NotFoundException("HttpContext not found");

            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new NotFoundException("User not found");

            var isAdmin = user.IsInRole("Admin");

            var query = _dbContext.Cars.AsQueryable();

            // 🔒 security
            if (!isAdmin)
                query = query.Where(c => c.UserId == userId);

            // 🔎 search
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.ToLower();

                query = query.Where(c =>
                    c.Make.ToLower().Contains(search) ||
                    c.Model.ToLower().Contains(search) ||
                    c.Vin.ToLower().Contains(search));
            }

            // 📊 total count BEFORE paging
            var totalCount = await query.CountAsync(cancellationToken);

            // ↕ sorting
            query = request.SortBy?.ToLower() switch
            {
                "year" => request.IsDescending
                    ? query.OrderByDescending(x => x.Year)
                    : query.OrderBy(x => x.Year),

                "mileage" => request.IsDescending
                    ? query.OrderByDescending(x => x.Mileage)
                    : query.OrderBy(x => x.Mileage),

                _ => query.OrderByDescending(x => x.CreatedAt)
            };

            // 📄 paging
            var skip = (request.Page - 1) * request.PageSize;

            var items = await query
                .Skip(skip)
                .Take(request.PageSize)
                .Select(c => new CarDto
                {
                    Id = c.CarId,
                    Color = c.Color,
                    CreatedAt = c.CreatedAt,
                    FuelType = c.FuelType,
                    IsPrimary = c.IsPrimary,
                    LicensePlate = c.LicensePlate,
                    Vin = c.Vin,
                    Make = c.Make,
                    Mileage = c.Mileage,
                    Model = c.Model,
                    Transmission = c.Transmission,
                    Year = c.Year
                })
                .ToListAsync(cancellationToken);

            var pagedResult = new PagedResponse<CarDto>(
                items,
                totalCount,
                request.Page,
                request.PageSize
            );

            return ApiResponse<PagedResponse<CarDto>>.Ok(
                pagedResult,
                "Cars retrieved successfully"
            );
        }
    }
}