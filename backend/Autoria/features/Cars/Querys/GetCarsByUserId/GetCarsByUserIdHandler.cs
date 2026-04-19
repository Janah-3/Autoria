using System.Security.Claims;
using Autoria.features.Cars.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Cars.Querys.GetCarsByUserId
{
    public class GetCarsByUserIdHandler
        : IRequestHandler<GetCarsByUserIdQuery, ApiResponse<PagedResponse<CarDto>>>
    {
        private readonly AppDbContext _dbContext;
        private readonly IHttpContextAccessor _contextAccessor;

        public GetCarsByUserIdHandler(
            AppDbContext dbContext,
            IHttpContextAccessor contextAccessor)
        {
            _dbContext = dbContext;
            _contextAccessor = contextAccessor;
        }

        public async Task<ApiResponse<PagedResponse<CarDto>>> Handle(
            GetCarsByUserIdQuery request,
            CancellationToken cancellationToken)
        {
            var user = _contextAccessor.HttpContext?.User
                ?? throw new NotFoundException("HttpContext not found");

            var currentUserId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new NotFoundException("User not found");

            var isAdmin = user.IsInRole("Admin");

            
            if (!isAdmin && currentUserId != request.UserId.ToString())
                throw new UnauthorizedException("You are not allowed to view these cars");

            var query = _dbContext.Cars
                .Where(c => c.UserId == request.UserId.ToString());

            
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.ToLower();

                query = query.Where(c =>
                    c.Make.ToLower().Contains(search) ||
                    c.Model.ToLower().Contains(search) ||
                    c.Vin.ToLower().Contains(search) ||
                    c.LicensePlate.ToLower().Contains(search));
            }

            
            var totalCount = await query.CountAsync(cancellationToken);

            
            query = request.SortBy?.ToLower() switch
            {
                "year" => request.IsDescending
                    ? query.OrderByDescending(x => x.Year)
                    : query.OrderBy(x => x.Year),

                "mileage" => request.IsDescending
                    ? query.OrderByDescending(x => x.Mileage)
                    : query.OrderBy(x => x.Mileage),

                "make" => request.IsDescending
                    ? query.OrderByDescending(x => x.Make)
                    : query.OrderBy(x => x.Make),

                _ => query.OrderByDescending(x => x.CreatedAt)
            };

           
            var skip = (request.Page - 1) * request.PageSize;

            var items = await query
                .Skip(skip)
                .Take(request.PageSize)
                .Select(c => new CarDto
                {
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

            var result = new PagedResponse<CarDto>(
                items,
                totalCount,
                request.Page,
                request.PageSize
            );

            return ApiResponse<PagedResponse<CarDto>>.Ok(
                result,
                "User cars retrieved successfully"
            );
        }
    }
}