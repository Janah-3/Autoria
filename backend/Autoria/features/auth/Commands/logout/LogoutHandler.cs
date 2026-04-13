using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.auth.Commands.logout
{
    public class LogoutHandler : IRequestHandler<LogoutCommand, Unit>
    {
        private readonly AppDbContext _db;

        public LogoutHandler(AppDbContext db)
        {
            _db = db;
        }
       

        async Task<Unit> IRequestHandler<LogoutCommand, Unit>.Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
                throw new BadRequestException("Refresh token is required.");


            var token = await _db.RefreshTokens.FirstOrDefaultAsync(x => x.token == request.RefreshToken);


            if (token.IsRevoked)
                throw new BadRequestException("Token already revoked.");

            token.IsRevoked = true;

            await _db.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
