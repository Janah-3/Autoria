using FluentValidation;

namespace Autoria.Features.JobRequests.Commands.CompleteJobRequest
{
    public class CompleteJobRequestValidator : AbstractValidator<CompleteJobRequestCommand>
    {
        public CompleteJobRequestValidator()
        {
            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Price must be greater than zero");
        }
    }
}