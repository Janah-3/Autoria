using System.Security.Claims;
using Autoria.features.Booking.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.BlockTimeSlot
{
    public class BlockTimeSlotHandler : IRequestHandler<BlockTimeSlotCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BlockTimeSlotHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(BlockTimeSlotCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var slot = await _db.TimeSlots
                .Include(ts => ts.ServiceCenter)
                .FirstOrDefaultAsync(ts => ts.Id == request.TimeSlotId, cancellationToken)
                ?? throw new NotFoundException("Time slot not found.");

            if (slot.ServiceCenter.UserId != userId)
                throw new ForbiddenException("You do not own this service center.");

            if (slot.IsBooked)
                throw new BadRequestException("Cannot block a slot that has an active booking.");

            if (slot.IsBlocked)
                throw new BadRequestException("Time slot is already blocked.");

            slot.IsBlocked = true;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }

}
