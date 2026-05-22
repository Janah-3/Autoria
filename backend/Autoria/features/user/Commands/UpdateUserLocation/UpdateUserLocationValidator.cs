using FluentValidation;

namespace Autoria.features.Users.Commands.UpdateUserLocation
{
    public class UpdateUserLocationValidator : AbstractValidator<UpdateUserLocationCommand>
    {
        public UpdateUserLocationValidator()
        {
            RuleFor(x => x.Latitude)
                .InclusiveBetween(-90, 90)
                .WithMessage("Latitude must be between -90 and 90");

            RuleFor(x => x.Longitude)
                .InclusiveBetween(-180, 180)
                .WithMessage("Longitude must be between -180 and 180");
        }
    }
}