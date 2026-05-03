using System.Security.Claims;
using Autoria.features.Booking.Dtos;
using Autoria.features.Booking.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Queries.GetBookingById
{
    public class GetBookingByIdHandler : IRequestHandler<GetBookingByIdQuery, BookingDetailDto>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetBookingByIdHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<BookingDetailDto> Handle(GetBookingByIdQuery request, CancellationToken cancellationToken)
        {
            var query = _db.Bookings
                .Include(b => b.User)
                .Include(b => b.Car)
                .Include(b => b.ServiceCenter)
                .Include(b => b.ServiceType)
                .Where(b => b.Id == request.BookingId);

            if (!request.BypassOwnerCheck)
            {
                var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? throw new UnauthorizedException("User not authenticated.");
                query = query.Where(b => b.UserId == userId);
            }

            var booking = await query.FirstOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException("Booking not found.");

            return BookingMapper.ToDetailDto(booking);
        }
    }
}
