using System.Security.Claims;
using Autoria.features.Car.Entity;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Car.Commands.AddCar
{
    public class AddCarHandler : IRequestHandler<AddCarCommand, Unit>
    {
        private readonly AppDbContext _dbContext;
        private readonly IHttpContextAccessor _contextAccessor;

        public AddCarHandler(AppDbContext dbContext, IHttpContextAccessor contextAccessor)
        {
            _dbContext = dbContext;
            _contextAccessor = contextAccessor;
        }

        public async Task<Unit> Handle(AddCarCommand request, CancellationToken cancellationToken)
        {
            
            var httpContext = _contextAccessor.HttpContext
                ?? throw new NotFoundException("HttpContext not found");

            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new NotFoundException("User not found");

            
            var vinExists = await _dbContext.Cars
                .AnyAsync(c => c.Vin == request.Vin, cancellationToken);

            if (vinExists)
                throw new BadRequestException("VIN already exists");

            
            if (request.IsPrimary)
            {
                await _dbContext.Cars
                    .Where(c => c.UserId == userId && c.IsPrimary)
                    .ExecuteUpdateAsync(
                        c => c.SetProperty(x => x.IsPrimary, false),
                        cancellationToken
                    );
            }

            var car = new Entity.Car
            {
                Make = request.Make,
                Model = request.Model,
                Year = request.Year,
                Vin = request.Vin,
                LicensePlate = request.LicensePlate,
                Mileage = request.Mileage,
                Color = request.Color,
                Transmission = request.Transmission,
                FuelType = request.FuelType,
                IsPrimary = request.IsPrimary,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            var hasCars = await _dbContext.Cars
                .AnyAsync(c => c.UserId == userId, cancellationToken);

            if (!hasCars)
                car.IsPrimary = true;

            await _dbContext.Cars.AddAsync(car, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}