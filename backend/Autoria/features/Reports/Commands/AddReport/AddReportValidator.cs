using FluentValidation;

namespace Autoria.features.Reports.Commands.AddReport
{
    public class AddReportValidator : AbstractValidator<AddReportCommand>
    {
        public AddReportValidator()
        {
            RuleFor(x => x.TargetType).IsInEnum();
            RuleFor(x => x.TargetId).NotEmpty();
            RuleFor(x => x.Reason).IsInEnum();
            RuleFor(x => x.Details)
                .MaximumLength(500)
                .When(x => x.Details != null);
        }
    }
}
