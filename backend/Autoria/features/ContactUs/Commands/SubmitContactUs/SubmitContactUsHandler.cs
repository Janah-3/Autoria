using System.Security.Claims;
using Autoria.features.ContactUs.Entity;
using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Persistence;
using MediatR;

namespace Autoria.features.ContactUs.Commands.SubmitContactUs
{
    public class SubmitContactUsHandler : IRequestHandler<SubmitContactUsCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IEmailService _emailService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SubmitContactUsHandler(AppDbContext db, IEmailService emailService, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _emailService = emailService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(SubmitContactUsCommand request, CancellationToken cancellationToken)
        {
            // Attach userId if authenticated, allow guests too
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

            var message = new ContactMessage
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FullName = request.FullName,
                Email = request.Email,
                Subject = request.Subject,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow
            };

            _db.ContactMessages.Add(message);
            await _db.SaveChangesAsync(cancellationToken);

            // Send confirmation email to the user
            await _emailService.SendMailAsync(
                request.Email,
                "We received your message — Autoria",
                $"<p>Hi {request.FullName},</p><p>Thank you for reaching out. We have received your message and will get back to you shortly.</p><p><strong>Subject:</strong> {request.Subject}</p>");

            return message.Id;
        }
    }
}
