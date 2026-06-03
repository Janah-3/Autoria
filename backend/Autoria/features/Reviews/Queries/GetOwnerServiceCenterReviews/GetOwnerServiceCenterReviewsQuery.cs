using Autoria.features.Reviews.Dtos;
using MediatR;

namespace Autoria.features.Reviews.Queries.GetOwnerServiceCenterReviews
{
    public record GetOwnerServiceCenterReviewsQuery(Guid ServiceCenterId) : IRequest<ServiceCenterReviewsDto>;
}
