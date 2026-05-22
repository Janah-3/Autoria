using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ContactUs.Commands.ResolveContactMessage
{
    public class ResolveContactMessageHandler : IRequestHandler<ResolveContactMessageCommand>
    {
        private readonly AppDbContext _db;

        public ResolveContactMessageHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task Handle(ResolveContactMessageCommand request, CancellationToken cancellationToken)
        {
            var message = await _db.ContactMessages
                .FirstOrDefaultAsync(m => m.Id == request.MessageId, cancellationToken)
                ?? throw new NotFoundException("Contact message not found.");

            if (message.IsResolved)
                throw new BadRequestException("Message is already resolved.");

            message.IsResolved = true;
            message.AdminNotes = request.AdminNotes;
            message.ResolvedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
