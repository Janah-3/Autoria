using System.Security.Claims;
using Autoria.features.Booking;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.features.Payments.Entities;
using Autoria.features.Payments.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Payments.Commands.CreateInvoice
{
    public class CreateInvoiceHandler : IRequestHandler<CreateInvoiceCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;

        public CreateInvoiceHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, INotificationService notificationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        public async Task<Guid> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var booking = await _db.Bookings
                .Include(b => b.ServiceCenter)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken)
                ?? throw new NotFoundException("Booking not found.");

            if (booking.ServiceCenter.UserId != userId)
                throw new ForbiddenException("Only the service center owner can create invoices.");

            if (booking.Status != BookingStatus.Completed)
                throw new BadRequestException("Invoice can only be created for completed bookings.");

            var existingInvoice = await _db.Invoices
                .AnyAsync(i => i.BookingId == request.BookingId, cancellationToken);
            if (existingInvoice)
                throw new ConflictException("An invoice already exists for this booking.");

            if (!request.Items.Any())
                throw new BadRequestException("Invoice must have at least one item.");

            var items = request.Items.Select(i => new InvoiceItem
            {
                Id = Guid.NewGuid(),
                Description = i.Description,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity
            }).ToList();

            var totalAmount = items.Sum(i => i.UnitPrice * i.Quantity);

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                BookingId = request.BookingId,
                ServiceCenterId = booking.ServiceCenterId,
                ClientId = booking.UserId,
                TotalAmount = totalAmount,
                Status = InvoiceStatus.Issued,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow,
                IssuedAt = DateTime.UtcNow,
                Items = items
            };

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync(cancellationToken);

            // Notify client that invoice is ready
            await _notificationService.SendAsync(
                userId: booking.UserId,
                userEmail: booking.User.Email!,
                type: NotificationType.InvoiceIssued,
                channel: NotificationChannel.Both,
                content: $"Your invoice from {booking.ServiceCenter.Name} is ready. Total: {totalAmount:C}. Please proceed with payment.");

            return invoice.Id;
        }
    }
}
