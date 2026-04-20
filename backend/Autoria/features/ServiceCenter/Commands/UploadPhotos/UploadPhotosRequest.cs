namespace Autoria.features.ServiceCenter.Commands.UploadPhotos
{
    public record UploadPhotosRequest(
     List<IFormFile> Photos
 );
}
