using MediatR;

namespace Autoria.features.Reviews.Commands.EditReview
{
    public record EditReviewCommand(
        Guid ReviewId,
        int Rating,
        string Comment,
        List<IFormFile>? NewPhotos,
        List<string>? PhotoUrlsToRemove
    ) : IRequest<Unit>;
}
