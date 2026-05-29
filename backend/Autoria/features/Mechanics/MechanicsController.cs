using Autoria.features.Mechanics.Queries.GetMyProfile;
using Autoria.Features.JobRequests.Commands.CreateJobRequest;
using Autoria.Features.Mechanics.Commands.ApproveMechanic;
using Autoria.Features.Mechanics.Commands.RejectMechanic;
using Autoria.Features.Mechanics.Commands.UpdateMechanicProfile;
using Autoria.Features.Mechanics.Queries.BrowseMechanics;
using Autoria.Features.Mechanics.Queries.GetMechanicEarnings;
using Autoria.Features.Mechanics.Queries.GetMechanicProfile;
using Autoria.Features.Mechanics.Queries.GetPendingMechanics;
using Autoria.shared.constants;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.Features.Mechanics
{
    [ApiController]
    [Route("api/mechanics")]
    public class MechanicsController : BaseController
    {

        public MechanicsController(IMediator mediator) : base(mediator) { }

        // Public
        [HttpGet]
        public async Task<IActionResult> Browse(
            [FromQuery] Guid? specializationId,
            [FromQuery] string? city,
            [FromQuery] double? latitude,
            [FromQuery] double? longitude,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(
                new BrowseMechanicsQuery(specializationId, city, latitude, longitude, page, pageSize));
            return Success(result);
        }

        [HttpGet("{mechanicId:guid}")]
        public async Task<IActionResult> GetProfile(Guid mechanicId)
        {
            var result = await _mediator.Send(new GetMechanicProfileQuery(mechanicId));
            return Success(result);
        }

        // Mechanic only
        [HttpPut("my/profile")]
        [Authorize(Roles = Roles.Mechanic)]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateMechanicProfileRequest request)
        {
            var command = new UpdateMechanicProfileCommand(
                City: request.City,
                Latitude: request.Latitude,
                Longitude: request.Longitude,
                YearsOfExperience: request.YearsOfExperience,
                ProfilePhoto: request.ProfilePhoto,
                SpecializationIds: request.SpecializationIds
            );
            await _mediator.Send(command);
            return Success("Profile updated successfully");
        }

        [HttpGet("my/profile")]
        [Authorize(Roles = Roles.Mechanic)]
        public async Task<IActionResult> getMyProfile([FromForm] GetMyProfileQuery query)
        {
           
            var result = await _mediator.Send(query);
            return Success(result);
        }

        [HttpGet("my/earnings")]
        [Authorize(Roles = Roles.Mechanic)]
        public async Task<IActionResult> GetEarnings(
            [FromQuery] DateOnly? from,
            [FromQuery] DateOnly? to)
        {
            var result = await _mediator.Send(new GetMechanicEarningsQuery( from, to));
            return Success(result);
        }

        // Admin only
        [HttpGet("pending")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetPending(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetPendingMechanicsQuery(page, pageSize));
            return Success(result);
        }

        [HttpPost("{mechanicId:guid}/approve")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Approve(Guid mechanicId)
        {
            await _mediator.Send(new ApproveMechanicCommand(mechanicId));
            return Success("Mechanic approved successfully");
        }

        [HttpPost("{mechanicId:guid}/reject")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Reject(Guid mechanicId, [FromBody] RejectMechanicCommand command)
        {
            await _mediator.Send(command with { MechanicId = mechanicId});
            return Success("Mechanic rejected successfully");
        }

        // Car owner — create a job request
        [HttpPost("{mechanicId}/job-requests")]
        [Authorize(Roles = Roles.User)]
        public async Task<IActionResult> Create(Guid mechanicId, [FromBody] CreateJobRequestCommand command)
        {
            await _mediator.Send(command with { MechanicId = mechanicId });
            return Success("Job request created successfully");
        }
    }
}