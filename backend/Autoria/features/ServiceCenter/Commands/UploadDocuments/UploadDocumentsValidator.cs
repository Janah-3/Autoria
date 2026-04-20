using FluentValidation;

namespace Autoria.features.ServiceCenter.Commands.UploadDocuments
{
    public class UploadDocumentsValidator : AbstractValidator<UploadDocumentsCommand>
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".pdf" };
        private const long _maxFileSize = 5 * 1024 * 1024; // 5MB

        public UploadDocumentsValidator()
        {
            RuleFor(x => x.CommercialRegFile).NotNull()
                .Must(BeValidFile).WithMessage("Commercial registration file is invalid");
            RuleFor(x => x.TaxCardFile).NotNull()
                .Must(BeValidFile).WithMessage("Tax card file is invalid");
            RuleFor(x => x.OwnerNationalIdFile).NotNull()
                .Must(BeValidFile).WithMessage("National ID file is invalid");
        }

        private bool BeValidFile(IFormFile file)
        {
            if (file == null || file.Length == 0 || file.Length > _maxFileSize)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLower();
            return _allowedExtensions.Contains(extension);
        }
    }
}
