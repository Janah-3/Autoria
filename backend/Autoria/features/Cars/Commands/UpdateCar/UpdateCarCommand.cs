using Autoria.features.Car.Entity;
using MediatR;
using System.Drawing;
using System.Threading.Channels;

namespace Autoria.features.Cars.Commands.UpdateCar
{
    public record UpdateCarCommand(
        int? Mileage,
        string? Color,
        string? LicensePlate,
        bool? IsPrimary,
        Guid carId
        ) : IRequest<Unit>;
    
}
