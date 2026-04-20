using MediatR;

namespace Autoria.features.ServiceCenter.Commands.UploadDocuments
{
    public record UploadDocumentsCommand(
     string UserId,
     IFormFile CommercialRegFile,
     IFormFile TaxCardFile,
     IFormFile OwnerNationalIdFile
 ) : IRequest<Unit>;
}
