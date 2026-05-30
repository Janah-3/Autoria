using Autoria.Features.JobRequests.Commands.AcceptJobRequest;
using Autoria.Features.JobRequests.Commands.CancelJobRequest;
using Autoria.Features.JobRequests.Commands.CompleteJobRequest;
using Autoria.Features.JobRequests.Commands.CreateJobRequest;
using Autoria.Features.JobRequests.Commands.RejectJobRequest;
using Autoria.Features.JobRequests.Queries.GetJobRequestDetails;
using Autoria.Features.JobRequests.Queries.GetMyJobRequests;
using Autoria.Features.JobRequests.Queries.GetMyJobs;
using Autoria.shared.constants;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.Features.JobRequests
{
    [ApiController]
    [Route("api/job-requests")]
    [Authorize]
    public class JobRequestsController : BaseController
    {
     
        public JobRequestsController(IMediator mediator) : base(mediator) { }

       

        // Car owner — view their job requests
        [HttpGet("my")]
        [Authorize(Roles = Roles.User)]
        public async Task<IActionResult> GetMyJobRequests(
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(
                new GetMyJobRequestsQuery( status, page, pageSize));
            return Success(result);
        }

        // Car owner — cancel a job request
        [HttpPost("{jobRequestId:guid}/cancel")]
        [Authorize(Roles = Roles.User)]
        public async Task<IActionResult> Cancel(
            Guid jobRequestId,
            [FromBody] CancelJobRequestCommand command)
        {
            await _mediator.Send(command with { JobRequestId = jobRequestId });
            return Success("Job request cancelled successfully");
        }

        // Mechanic — view incoming jobs
        [HttpGet("my-jobs")]
        [Authorize(Roles = Roles.Mechanic)]
        public async Task<IActionResult> GetMyJobs(
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetMyJobsQueryMechanic(status, page, pageSize));
            return Success(result);
        }

        // Mechanic — accept a job request
        [HttpPost("{jobRequestId:guid}/accept")]
        [Authorize(Roles = Roles.Mechanic)]
        public async Task<IActionResult> Accept(Guid jobRequestId)
        {
            await _mediator.Send(new AcceptJobRequestCommand(jobRequestId));
            return Success("Job request accepted successfully");
        }

        // Mechanic — reject a job request
        [HttpPost("{jobRequestId:guid}/reject")]
        [Authorize(Roles = Roles.Mechanic)]
        public async Task<IActionResult> Reject(
            Guid jobRequestId,
            [FromBody] RejectJobRequestCommand command)
        {
            await _mediator.Send(command with { JobRequestId = jobRequestId });
            return Success("Job request rejected successfully");
        }

        // Mechanic — complete a job request
        [HttpPost("{jobRequestId:guid}/complete")]
        [Authorize(Roles = Roles.Mechanic)]
        public async Task<IActionResult> Complete(
            Guid jobRequestId,
            [FromBody] CompleteJobRequestCommand command)
        {
            await _mediator.Send(command with { JobRequestId = jobRequestId});
            return Success("Job request completed successfully");
        }

        // Both car owner and mechanic — view details
        [HttpGet("{jobRequestId:guid}")]
        public async Task<IActionResult> GetDetails(Guid jobRequestId)
        {
            var result = await _mediator.Send(
                new GetJobRequestDetailsQuery(jobRequestId));
            return Success(result);
        }
    }
}