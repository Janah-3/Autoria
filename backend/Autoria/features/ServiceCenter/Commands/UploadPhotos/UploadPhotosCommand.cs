using MediatR;

namespace Autoria.features.ServiceCenter.Commands.UploadPhotos
{
    public record UploadPhotosCommand(
     string UserId,
     List<IFormFile> Photos
 ) : IRequest<Unit>;
}
