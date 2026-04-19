using System.Security.Claims;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Cars.Commands.DeleteCar
{
    public class DeleteCarHandler : IRequestHandler<DeleteCarCommand, Unit>
    {
        private readonly AppDbContext _dbContext;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IAdminLogService _adminLog;

        public DeleteCarHandler(
            AppDbContext dbContext,
            IHttpContextAccessor contextAccessor,
            IAdminLogService adminLog)
        {
            _dbContext = dbContext;
            _contextAccessor = contextAccessor;
            _adminLog = adminLog;
        }

        public async Task<Unit> Handle(DeleteCarCommand request, CancellationToken cancellationToken)
        {
            var httpContext = _contextAccessor.HttpContext
                ?? throw new NotFoundException("HttpContext not found");

            var user = httpContext.User;

            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new NotFoundException("User not found");

            var car = await _dbContext.Cars
                .FirstOrDefaultAsync(c => c.CarId == request.CarId, cancellationToken)
                ?? throw new NotFoundException("Car not found");

            if (user.IsInRole("User"))
            {
                if (car.UserId != userId)
                    throw new UnauthorizedException("Unauthorized action");
            }

            _dbContext.Cars.Remove(car);
            await _dbContext.SaveChangesAsync(cancellationToken);

          
            if (user.IsInRole("Admin"))
            {
                await _adminLog.LogAsync(
                    userId,
                    AdminActionType.deleteCar,
                    AdminTargetType.Car,
                    car.CarId.ToString(),
                    null
                );
            }

            return Unit.Value;
        }
    }
}