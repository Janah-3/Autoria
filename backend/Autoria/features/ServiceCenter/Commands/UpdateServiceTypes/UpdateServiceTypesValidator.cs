using FluentValidation;

namespace Autoria.features.ServiceCenter.Commands.UpdateServiceTypes
{
    public class UpdateServiceTypesValidator : AbstractValidator<UpdateServiceTypesCommand>
    {
        public UpdateServiceTypesValidator()
        {
            RuleFor(x => x.ServiceTypeIds)
                .NotEmpty().WithMessage("At least one service type is required")
                .Must(ids => ids.Distinct().Count() == ids.Count)
                .WithMessage("Duplicate service types are not allowed");
        }
    }
}
