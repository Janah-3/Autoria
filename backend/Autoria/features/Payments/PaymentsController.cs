using Autoria.features.Payments.Commands.ConfirmCashPayment;
using Autoria.features.Payments.Commands.CreateInvoice;
using Autoria.features.Payments.Commands.ProcessPayment;
using Autoria.features.Payments.Commands.RefundPayment;
using Autoria.features.Payments.Dtos;
using Autoria.features.Payments.Enums;
using Autoria.features.Payments.Queries.GetInvoiceByBooking;
using Autoria.features.Payments.Queries.GetPaymentHistory;
using Autoria.features.Payments.Queries.GetRevenueStats;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Payments
{
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PaymentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ── Invoice ────────────────────────────────────────────────────────────

        /// <summary>Owner creates invoice after booking is completed</summary>
        [HttpPost("invoices")]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceRequest request)
        {
            var invoiceId = await _mediator.Send(new CreateInvoiceCommand(
                request.BookingId,
                request.Items,
                request.Notes));
            return Ok(ApiResponse<Guid>.Ok(invoiceId, "Invoice created and sent to client."));
        }

        /// <summary>Get invoice for a booking — visible to client and owner</summary>
        [HttpGet("invoices/booking/{bookingId:guid}")]
        public async Task<IActionResult> GetInvoice(Guid bookingId)
        {
            var result = await _mediator.Send(new GetInvoiceByBookingQuery(bookingId));
            return Ok(ApiResponse<InvoiceDto>.Ok(result));
        }

        // ── Payment ────────────────────────────────────────────────────────────

        /// <summary>Client chooses payment method — Cash or Card</summary>
        [HttpPost("pay")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest request)
        {
            var result = await _mediator.Send(new ProcessPaymentCommand(
                request.InvoiceId,
                request.Method,
                request.CardToken));
            return Ok(ApiResponse<ProcessPaymentResult>.Ok(result, result.Message!));
        }

        /// <summary>Owner confirms cash was received physically</summary>
        [HttpPatch("{paymentId:guid}/confirm-cash")]
        public async Task<IActionResult> ConfirmCashPayment(Guid paymentId)
        {
            await _mediator.Send(new ConfirmCashPaymentCommand(paymentId));
            return Ok(ApiResponse<object>.Ok(null!, "Cash payment confirmed."));
        }

        /// <summary>Get payment history for current user</summary>
        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyPayments(
            [FromQuery] PaymentStatus? status,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetPaymentHistoryQuery(
                null, null, status, dateFrom, dateTo, page, pageSize, CurrentUserOnly: true));
            return Ok(ApiResponse<PagedResponse<PaymentDto>>.Ok(result));
        }

        // ── Admin ──────────────────────────────────────────────────────────────

        /// <summary>View all transactions with filters — admin only</summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPayments(
            [FromQuery] Guid? serviceCenterId,
            [FromQuery] PaymentMethod? method,
            [FromQuery] PaymentStatus? status,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetPaymentHistoryQuery(
                serviceCenterId, method, status, dateFrom, dateTo, page, pageSize));
            return Ok(ApiResponse<PagedResponse<PaymentDto>>.Ok(result));
        }

        /// <summary>Manually trigger refund — admin only</summary>
        [HttpPatch("admin/{paymentId:guid}/refund")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RefundPayment(Guid paymentId, [FromBody] RefundPaymentRequest request)
        {
            await _mediator.Send(new RefundPaymentCommand(paymentId, request.Reason));
            return Ok(ApiResponse<object>.Ok(null!, "Payment refunded successfully."));
        }

        /// <summary>Revenue stats — admin only</summary>
        [HttpGet("admin/stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRevenueStats(
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] Guid? serviceCenterId)
        {
            var result = await _mediator.Send(new GetRevenueStatsQuery(dateFrom, dateTo, serviceCenterId));
            return Ok(ApiResponse<RevenueStatsDto>.Ok(result));
        }
    }

    public record CreateInvoiceRequest(Guid BookingId, List<InvoiceItemRequest> Items, string? Notes);
    public record ProcessPaymentRequest(Guid InvoiceId, PaymentMethod Method, string? CardToken);
    public record RefundPaymentRequest(string Reason);
}
