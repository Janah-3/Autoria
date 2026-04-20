using Autoria.features.ServiceCenter.Dtos;
using Autoria.features.ServiceCenter.Mappers;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Autoria.features.ServiceCenter.Querys.GetMyServiceCenter
{
    public class GetMyServiceCenterHandler : IRequestHandler<GetMyServiceCenterQuery, ServiceCenterDetailDto>
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetMyServiceCenterHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ServiceCenterDetailDto> Handle(GetMyServiceCenterQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("unauthorized user");

            var ServiceCenter = await _context.ServiceCenters
                .Include(sc => sc.Photos)
                .Include(sc => sc.Documents)
                .Include(sc => sc.OperatingHours)
                .Include(sc => sc.ServiceTypes).ThenInclude(st => st.ServiceType)
                .Include(sc => sc.CarBrands).ThenInclude(cb => cb.CarBrand)
                .FirstOrDefaultAsync(sc => sc.UserId == userId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            return ServiceCenterMapper.ToDetailDto(ServiceCenter);
        }


    }
}
