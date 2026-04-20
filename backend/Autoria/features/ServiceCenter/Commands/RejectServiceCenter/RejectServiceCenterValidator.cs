using FluentValidation;

namespace Autoria.features.ServiceCenter.Commands.RejectServiceCenter
{
    public class RejectServiceCenterValidator : AbstractValidator<RejectServiceCenterCommand>
    {
        public RejectServiceCenterValidator()
        {
            RuleFor(x => x.RejectionReason)
                .NotEmpty().WithMessage("Rejection reason is required")
                .MaximumLength(500);
        }
    }
}
