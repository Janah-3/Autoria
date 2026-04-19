using System.Security.Claims;
using Autoria.features.Cars.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Cars.Querys.GetCarById
{
    public class GetCarByIdHandler : IRequestHandler<GetCarByIdQuery, CarDto>
    {
        private readonly AppDbContext _dbContext;
        private readonly IHttpContextAccessor _contextAccessor;

        public GetCarByIdHandler(
            AppDbContext dbContext,
            IHttpContextAccessor contextAccessor)
        {
            _dbContext = dbContext;
            _contextAccessor = contextAccessor;
        }

        public async Task<CarDto> Handle(GetCarByIdQuery request, CancellationToken cancellationToken)
        {
            var httpContext = _contextAccessor.HttpContext
                ?? throw new NotFoundException("HttpContext not found");

            var user = httpContext.User;

            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new NotFoundException("User not found");

            var car = await _dbContext.Cars
                .FirstOrDefaultAsync(c => c.CarId == request.CarId, cancellationToken)
                ?? throw new NotFoundException("Car not found");

           
            if (!user.IsInRole("Admin") && car.UserId != userId)
                throw new UnauthorizedException("Unauthorized access");

            return new CarDto
            {
                Color = car.Color,
                CreatedAt = car.CreatedAt,
                FuelType = car.FuelType,
                IsPrimary = car.IsPrimary,
                LicensePlate = car.LicensePlate,
                Vin = car.Vin,
                Make = car.Make,
                Mileage = car.Mileage,
                Model = car.Model,
                Transmission = car.Transmission,
                Year = car.Year
            };
        }
    }
}