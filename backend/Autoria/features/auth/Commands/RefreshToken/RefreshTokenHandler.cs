using Autoria.features.auth.Dtos;
using Autoria.Infrastructure.Identity.Contracts;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.auth.Commands.RefreshToken
{
    public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
    {
        private readonly AppDbContext _context;
        private readonly IJwtService _jwtService;

        public RefreshTokenHandler(AppDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var refreshToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.token == request.RefreshToken, cancellationToken)
                    ?? throw new BadRequestException("Invalid or expired refresh token6666666666");

            if (refreshToken.IsRevoked)
                throw new BadRequestException("Invalid or expired refresh token");

            if (refreshToken.ExpiresAt < DateTime.UtcNow)
                throw new BadRequestException("Invalid or expired refresh token");

            // Revoke old token
            refreshToken.IsRevoked = true;

            await _context.SaveChangesAsync(cancellationToken);

            // Generate new tokens using your existing JwtService
            var result = await _jwtService.GenerateToken(refreshToken.User);

            return result;
        }
    }
}
