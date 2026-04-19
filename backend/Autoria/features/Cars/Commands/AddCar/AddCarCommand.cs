using Autoria.shared.Enums;
using MediatR;

namespace Autoria.features.Car.Commands.AddCar
{
    public record AddCarCommand(
     string Make ,
     string Model  ,
     int Year ,
     string Vin ,
     string LicensePlate ,
     int Mileage ,
     string Color ,
     Transmission Transmission ,
     FuelType FuelType ,
     bool IsPrimary ,
     DateTime CreatedAt 
        ) : IRequest<Unit>;
    
}
