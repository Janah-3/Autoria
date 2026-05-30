using System.Security.Claims;
using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.SendPromotion
{
    public class SendPromotionHandler : IRequestHandler<SendPromotionCommand, int>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;
        private readonly Subscribtion.Services.IPremiumGuard _premiumGuard;

        // Spam prevention — max 2 promos per center per month
        private const int MaxPromosPerMonth = 2;

        public SendPromotionHandler(
            AppDbContext db,
            IHttpContextAccessor httpContextAccessor,
            IEmailService emailService,
            Subscribtion.Services.IPremiumGuard premiumGuard)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
            _premiumGuard = premiumGuard;
        }

        public async Task<int> Handle(SendPromotionCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var center = await _db.ServiceCenters
                .FirstOrDefaultAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Service center not found.");

            // Premium check
            await _premiumGuard.EnsurePremiumAsync(request.ServiceCenterId, cancellationToken);

            // Spam prevention — check how many promos sent this month
            var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var promosThisMonth = await _db.PromotionLogs
                .CountAsync(p => p.ServiceCenterId == request.ServiceCenterId && p.SentAt >= monthStart, cancellationToken);

            if (promosThisMonth >= MaxPromosPerMonth)
                throw new BadRequestException($"You have reached the limit of {MaxPromosPerMonth} promotional emails per month.");

            // Get distinct clients who booked with this center
            var clientEmails = await _db.Bookings
                .Include(b => b.User)
                .Where(b => b.ServiceCenterId == request.ServiceCenterId)
                .Select(b => b.User.Email!)
                .Distinct()
                .ToListAsync(cancellationToken);

            if (!clientEmails.Any())
                throw new BadRequestException("No past clients found to send promotions to.");

            // Send emails
            var sentCount = 0;
            foreach (var email in clientEmails)
            {
                await _emailService.SendMailAsync(email, request.Subject, request.Body);
                sentCount++;
            }

            // Log the promotion to enforce spam prevention
            _db.PromotionLogs.Add(new Entities.PromotionLog
            {
                Id = Guid.NewGuid(),
                ServiceCenterId = request.ServiceCenterId,
                Subject = request.Subject,
                RecipientCount = sentCount,
                SentAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync(cancellationToken);

            return sentCount;
        }
    }
}
