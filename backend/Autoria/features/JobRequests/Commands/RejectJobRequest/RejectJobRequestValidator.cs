using FluentValidation;

namespace Autoria.Features.JobRequests.Commands.RejectJobRequest
{
    public class RejectJobRequestValidator : AbstractValidator<RejectJobRequestCommand>
    {
        public RejectJobRequestValidator()
        {
            RuleFor(x => x.Reason)
                .NotEmpty().WithMessage("Rejection reason is required")
                .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters");
        }
    }
}