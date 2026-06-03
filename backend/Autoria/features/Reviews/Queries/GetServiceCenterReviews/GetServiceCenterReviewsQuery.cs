using Autoria.features.Reviews.Dtos;
using MediatR;

namespace Autoria.features.Reviews.Queries.GetServiceCenterReviews
{
    public record GetServiceCenterReviewsQuery(Guid ServiceCenterId) : IRequest<ServiceCenterReviewsDto>;
}
