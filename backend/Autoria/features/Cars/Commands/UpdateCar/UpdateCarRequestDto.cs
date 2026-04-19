namespace Autoria.features.Cars.Commands.UpdateCar
{
    public record UpdateCarRequestDto
    (
        int? Mileage,
        string? Color,
        string? LicensePlate,
        bool? IsPrimary
    );
}
