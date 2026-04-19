using System.Security.Claims;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Cars.Commands.UpdateCar
{
    public class UpdateCarHandler : IRequestHandler<UpdateCarCommand, Unit>
    {
        private readonly AppDbContext _dbContext;
        private readonly IHttpContextAccessor _contextAccessor;

        public UpdateCarHandler(AppDbContext dbContext, IHttpContextAccessor contextAccessor)
        {
            _dbContext = dbContext;
            _contextAccessor = contextAccessor;
        }

        public async Task<Unit> Handle(UpdateCarCommand request, CancellationToken cancellationToken)
        {
            var httpContext = _contextAccessor.HttpContext
                ?? throw new NotFoundException("HttpContext not found");

            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new NotFoundException("User not found");

            var car = await _dbContext.Cars
                .FirstOrDefaultAsync(c => c.CarId == request.carId, cancellationToken)
                ?? throw new NotFoundException("Car not found");

            
            if (car.UserId != userId)
                throw new UnauthorizedException("Unauthorized action");

           
            if (request.IsPrimary == true)
            {
                await _dbContext.Cars
                    .Where(c => c.UserId == userId && c.IsPrimary && c.CarId != car.CarId)
                    .ExecuteUpdateAsync(
                        c => c.SetProperty(x => x.IsPrimary, false),
                        cancellationToken
                    );

                car.IsPrimary = true;
            }

           
            if (request.IsPrimary == false && car.IsPrimary)
            {
                var hasOtherPrimary = await _dbContext.Cars
                    .AnyAsync(c => c.UserId == userId && c.CarId != car.CarId && c.IsPrimary, cancellationToken);

                if (!hasOtherPrimary)
                    throw new BadRequestException("You must have at least one primary car");

                car.IsPrimary = false;
            }

            
            car.Color = request.Color ?? car.Color;
            car.LicensePlate = request.LicensePlate ?? car.LicensePlate;
            car.Mileage = request.Mileage ?? car.Mileage;

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}