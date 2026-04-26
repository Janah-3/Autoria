using System;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Autoria.features.Reviews.Commands.AddReview
{
    public record AddReviewCommand(
     Guid ServiceCenterId,
     Guid BookingId,
     int Rating,
     string Comment,
     List<IFormFile>? Photos
 ) : IRequest<Unit>;



}
