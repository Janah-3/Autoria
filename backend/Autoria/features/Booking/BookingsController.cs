using Autoria.features.Booking.Commands.BlockTimeSlot;
using Autoria.features.Booking.Commands.CancelBooking;
using Autoria.features.Booking.Commands.CompleteBooking;
using Autoria.features.Booking.Commands.ConfirmBooking;
using Autoria.features.Booking.Commands.CreateBooking;
using Autoria.features.Booking.Commands.RescheduleBooking;
using Autoria.features.Booking.Commands.UnblockTimeSlot;
using Autoria.features.Booking.Dtos;
using Autoria.features.Booking.Queries.GetAllBookings;
using Autoria.features.Booking.Queries.GetAvailableSlots;
using Autoria.features.Booking.Queries.GetBookingById;
using Autoria.features.Booking.Queries.GetBookingStatus;
using Autoria.features.Booking.Queries.GetUserBookings;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Booking
{
    [ApiController]
    [Route("api/bookings")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BookingsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ── Time Slots ─────────────────────────────────────────────────────────

        /// <summary>Get available time slots for a service center on a given date</summary>
        [HttpGet("slots")]
        public async Task<IActionResult> GetAvailableSlots(
            [FromQuery] Guid serviceCenterId,
            [FromQuery] DateOnly date)
        {
            var result = await _mediator.Send(new GetAvailableSlotsQuery(serviceCenterId, date));
            return Ok(ApiResponse<List<TimeSlotDto>>.Ok(result));
        }

        /// <summary>Block a time slot — service center owner only</summary>
        [HttpPost("slots/block")]
        public async Task<IActionResult> BlockTimeSlot([FromBody] BlockTimeSlotCommand command)
        {
            var slotId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetAvailableSlots), new { },
                ApiResponse<Guid>.Ok(slotId, "Time slot blocked successfully."));
        }

        /// <summary>Unblock / delete a time slot — service center owner only</summary>
        [HttpDelete("slots/{slotId:guid}")]
        public async Task<IActionResult> UnblockTimeSlot(Guid slotId)
        {
            await _mediator.Send(new UnblockTimeSlotCommand(slotId));
            return Ok(ApiResponse<object>.Ok(null!, "Time slot unblocked successfully."));
        }

        // ── User Bookings ──────────────────────────────────────────────────────

        /// <summary>Create a new booking by selecting a time slot</summary>
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingCommand command)
        {
            var bookingId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetBookingById), new { id = bookingId },
                ApiResponse<Guid>.Ok(bookingId, "Booking created successfully."));
        }

        /// <summary>Get current user's booking history with optional status filter</summary>
        [HttpGet]
        public async Task<IActionResult> GetUserBookings(
            [FromQuery] BookingStatus? statusFilter,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetUserBookingsQuery(statusFilter, page, pageSize));
            return Ok(ApiResponse<PagedResponse<BookingSummaryDto>>.Ok(result));
        }

        /// <summary>Get booking details by ID — user sees only their own</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetBookingById(Guid id)
        {
            var result = await _mediator.Send(new GetBookingByIdQuery(id));
            return Ok(ApiResponse<BookingDetailDto>.Ok(result));
        }

        /// <summary>Cancel a booking — releases the time slot</summary>
        [HttpPatch("{id:guid}/cancel")]
        public async Task<IActionResult> CancelBooking(Guid id, [FromBody] CancelBookingRequest request)
        {
            await _mediator.Send(new CancelBookingCommand(id, request.CancellationReason));
            return Ok(ApiResponse<object>.Ok(null!, "Booking cancelled successfully."));
        }

        /// <summary>Reschedule a booking to a new time slot</summary>
        [HttpPatch("{id:guid}/reschedule")]
        public async Task<IActionResult> RescheduleBooking(Guid id, [FromBody] RescheduleBookingRequest request)
        {
            await _mediator.Send(new RescheduleBookingCommand(id, request.NewTimeSlotId));
            return Ok(ApiResponse<object>.Ok(null!, "Booking rescheduled successfully."));
        }

        /// <summary>Confirm a booking — service center owner only</summary>
        [HttpPatch("{id:guid}/confirm")]
        public async Task<IActionResult> ConfirmBooking(Guid id)
        {
            await _mediator.Send(new ConfirmBookingCommand(id));
            return Ok(ApiResponse<object>.Ok(null!, "Booking confirmed successfully."));
        }

        /// <summary>Mark a booking as completed — service center owner only</summary>
        [HttpPatch("{id:guid}/complete")]
        public async Task<IActionResult> CompleteBooking(Guid id, [FromBody] CompleteBookingRequest request)
        {
            await _mediator.Send(new CompleteBookingCommand(id, request.TotalPrice));
            return Ok(ApiResponse<object>.Ok(null!, "Booking completed successfully."));
        }

        // ── Admin ──────────────────────────────────────────────────────────────

        /// <summary>List all bookings with filters — admin only</summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBookings([FromQuery] BookingFilterDto filter)
        {
            var result = await _mediator.Send(new GetAllBookingsQuery(filter));
            return Ok(ApiResponse<PagedResponse<BookingSummaryAdminDto>>.Ok(result));
        }

        /// <summary>View any booking details — admin only</summary>
        [HttpGet("admin/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBookingByIdAdmin(Guid id)
        {
            var result = await _mediator.Send(new GetBookingByIdQuery(id, BypassOwnerCheck: true));
            return Ok(ApiResponse<BookingDetailDto>.Ok(result));
        }

        /// <summary>Manually cancel any booking — admin only</summary>
        [HttpPatch("admin/{id:guid}/cancel")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminCancelBooking(Guid id, [FromBody] CancelBookingRequest request)
        {
            await _mediator.Send(new CancelBookingCommand(id, request.CancellationReason, BypassOwnerCheck: true));
            return Ok(ApiResponse<object>.Ok(null!, "Booking cancelled by admin."));
        }

        /// <summary>Booking stats — admin only</summary>
        [HttpGet("admin/stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBookingStats(
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var result = await _mediator.Send(new GetBookingStatsQuery(dateFrom, dateTo));
            return Ok(ApiResponse<BookingStatsDto>.Ok(result));
        }
    }

    public record CancelBookingRequest(string? CancellationReason);
    public record RescheduleBookingRequest(Guid NewTimeSlotId);
    public record CompleteBookingRequest(decimal? TotalPrice);
}
