using FluentValidation;

namespace Autoria.Features.JobRequests.Commands.CreateJobRequest
{
    public class CreateJobRequestValidator : AbstractValidator<CreateJobRequestCommand>
    {
        public CreateJobRequestValidator()
        {
            RuleFor(x => x.MechanicId).NotEmpty().WithMessage("Mechanic is required");
            RuleFor(x => x.CarId).NotEmpty().WithMessage("Car is required");
            RuleFor(x => x.ProblemDescription)
                .NotEmpty().WithMessage("Problem description is required")
                .MaximumLength(1000).WithMessage("Problem description cannot exceed 1000 characters");
            RuleFor(x => x.LocationAddress)
                .NotEmpty().WithMessage("Location address is required")
                .MaximumLength(500).WithMessage("Location address cannot exceed 500 characters");
         
        }
    }
}