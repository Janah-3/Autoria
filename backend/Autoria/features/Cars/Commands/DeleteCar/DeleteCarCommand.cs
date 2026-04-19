using MediatR;

namespace Autoria.features.Cars.Commands.DeleteCar
{
    public record DeleteCarCommand
    (
        Guid CarId
        ) :IRequest<Unit>;
}
