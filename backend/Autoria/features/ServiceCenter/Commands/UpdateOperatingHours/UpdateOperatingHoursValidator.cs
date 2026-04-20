using FluentValidation;

namespace Autoria.features.ServiceCenter.Commands.UpdateOperatingHours
{
    public class UpdateOperatingHoursValidator : AbstractValidator<UpdateOperatingHoursCommand>
    {
        public UpdateOperatingHoursValidator()
        {
            RuleFor(x => x.OperatingHours)
                .NotEmpty().WithMessage("Operating hours are required")
                .Must(operatingHours => operatingHours.Count == 7)
                .WithMessage("All 7 days must be provided")
                .Must(hours => hours.Select(h => h.Day).Distinct().Count() == 7)
                .WithMessage("Duplicate days are not allowed");

            RuleForEach(x => x.OperatingHours).ChildRules(hour =>
            {
                hour.RuleFor(h => h.Day).IsInEnum();
                hour.When(h => !h.IsClosed, () =>
                {
                    hour.RuleFor(h => h.OpenTime).NotEmpty();
                    hour.RuleFor(h => h.CloseTime).NotEmpty()
                        .Must((item, closeTime) => closeTime > item.OpenTime)
                        .WithMessage("Close time must be after open time");
                });
            });
        }
    }
}
