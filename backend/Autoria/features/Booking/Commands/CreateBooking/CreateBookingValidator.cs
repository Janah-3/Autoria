using FluentValidation;

namespace Autoria.features.Booking.Commands.CreateBooking
{
    public class CreateBookingValidator : AbstractValidator<CreateBookingCommand>
    {
        public CreateBookingValidator()
        {
            RuleFor(x => x.CarId).NotEmpty().WithMessage("Car is required.");
            RuleFor(x => x.ServiceCenterId).NotEmpty().WithMessage("Service center is required.");
            RuleFor(x => x.ServiceTypeId).NotEmpty().WithMessage("Service type is required.");
            RuleFor(x => x.TimeSlotId).NotEmpty().WithMessage("Time slot is required.");
            RuleFor(x => x.Notes).MaximumLength(500).When(x => x.Notes is not null);
        }
    }
}
