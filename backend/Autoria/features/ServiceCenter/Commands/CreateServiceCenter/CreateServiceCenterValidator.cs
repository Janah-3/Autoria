using FluentValidation;

namespace Autoria.features.ServiceCenter.Commands.CreateServiceCenter
{
    public class CreateServiceCenterValidator : AbstractValidator<CreateServiceCenterCommand>
    {
        public CreateServiceCenterValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Governorate).NotEmpty();
            RuleFor(x => x.District).NotEmpty();
            RuleFor(x => x.StreetAddress).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Phone).NotEmpty().Matches(@"^01[0125][0-9]{8}$")
                .WithMessage("Invalid Egyptian phone number");
            RuleFor(x => x.BusinessEmail).NotEmpty().EmailAddress();
            RuleFor(x => x.YearEstablished)
                .InclusiveBetween(1900, DateTime.UtcNow.Year)
                .WithMessage($"Year must be between 1900 and {DateTime.UtcNow.Year}");
            RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
            RuleFor(x => x.CommercialRegNo).NotEmpty().Matches(@"^\d{7}$")
                .WithMessage("Commercial registration number must be 7 digits");
            RuleFor(x => x.TaxCardNo).NotEmpty().Matches(@"^\d{9}$")
                .WithMessage("Tax card number must be 9 digits");
            RuleFor(x => x.OwnerNationalId).NotEmpty().Matches(@"^\d{14}$")
                .WithMessage("National ID must be 14 digits");
            RuleFor(x => x.OwnerFullName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.NumServiceBays).GreaterThan(0);
            RuleFor(x => x.Type).IsInEnum();
            RuleFor(x => x.Latitude).InclusiveBetween(-90, 90);
            RuleFor(x => x.Longitude).InclusiveBetween(-180, 180);
        }
    }
}
