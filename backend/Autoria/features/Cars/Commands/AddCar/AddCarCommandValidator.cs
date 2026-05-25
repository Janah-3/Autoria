using Autoria.features.Car.Commands.AddCar;
using FluentValidation;

namespace Autoria.features.Cars.Commands.AddCar
{
    public class AddCarCommandValidator :AbstractValidator<AddCarCommand>
    {

        public AddCarCommandValidator()
        {
            RuleFor(x => x.Make)
                .NotEmpty().WithMessage("Make is required")
                .MaximumLength(50);

            RuleFor(x => x.Model)
                .NotEmpty().WithMessage("Model is required")
                .MaximumLength(50);

            RuleFor(x => x.Year)
                .InclusiveBetween(1886, DateTime.Now.Year) // first car invented ~1886
                .WithMessage("Year must be between 1900 and current year");

            RuleFor(x => x.Vin)
                .NotEmpty().WithMessage("VIN is required")
                .Length(17).WithMessage("VIN must be exactly 17 characters");

            RuleFor(x => x.LicensePlate)
                .NotEmpty().WithMessage("License plate is required")
                .MaximumLength(20);

            RuleFor(x => x.Mileage)
                .GreaterThanOrEqualTo(0).WithMessage("Mileage cannot be negative");

            RuleFor(x => x.Color)
                .NotEmpty().WithMessage("Color is required");

            

            RuleFor(x => x.CreatedAt)
                .LessThanOrEqualTo(DateTime.UtcNow)
                .WithMessage("Created date cannot be in the future");
        }
    }
}

