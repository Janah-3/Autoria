using Autoria.features.ContactUs.Commands.ResolveContactMessage;
using Autoria.features.ContactUs.Commands.SubmitContactUs;
using Autoria.features.ContactUs.Dto;
using Autoria.features.ContactUs.Queries.GetContactMessages;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.ContactUs
{
    [ApiController]
    [Route("api/contact")]
    public class ContactUsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ContactUsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>Submit a contact message — open to guests and authenticated users</summary>
        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] SubmitContactUsCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.Ok(id, "Your message has been received. We will get back to you soon."));
        }

        /// <summary>List all contact messages — admin only</summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMessages(
            [FromQuery] bool? isResolved,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetContactMessagesQuery(isResolved, page, pageSize));
            return Ok(ApiResponse<PagedResponse<ContactMessageDto>>.Ok(result));
        }

        /// <summary>Resolve a contact message — admin only</summary>
        [HttpPatch("admin/{id:guid}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Resolve(Guid id, [FromBody] ResolveContactMessageRequest request)
        {
            await _mediator.Send(new ResolveContactMessageCommand(id, request.AdminNotes));
            return Ok(ApiResponse<object>.Ok(null!, "Message resolved successfully."));
        }
    }

    public record ResolveContactMessageRequest(string? AdminNotes);
}
