namespace Autoria.features.ServiceCenter.Commands.UploadDocuments
{
    public record UploadDocumentsRequest(
      IFormFile CommercialRegFile,
      IFormFile TaxCardFile,
      IFormFile OwnerNationalIdFile
  );
}
