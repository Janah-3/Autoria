using Autoria.features.Cars.Dtos;
using MediatR;

namespace Autoria.features.Cars.Querys.GetCarById
{
    public record GetCarByIdQuery
    (
        Guid CarId
        ):IRequest<CarDto>;
}
