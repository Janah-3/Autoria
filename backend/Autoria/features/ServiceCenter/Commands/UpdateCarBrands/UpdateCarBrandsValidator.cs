using FluentValidation;

namespace Autoria.features.ServiceCenter.Commands.UpdateCarBrands
{
    public class UpdateCarBrandsValidator : AbstractValidator<UpdateCarBrandsCommand>
    {
        public UpdateCarBrandsValidator()
        {
            RuleFor(x => x.CarBrandIds)
                .NotEmpty().WithMessage("At least one car brand is required")
                .Must(ids => ids.Distinct().Count() == ids.Count)
                .WithMessage("Duplicate car brands are not allowed");
        }
    }
}
