using Autoria.features.ServiceCenter.Dtos;
using Autoria.features.ServiceCenter.Mappers;
using Autoria.features.ServiceCenter.Querys.GetMyServiceCenter;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Querys.GetServiceCenterById
{
    public class GetServiceCenterByIdHandler : IRequestHandler<GetServiceCenterByIdQuery, ServiceCenterDetailDto>
    {
        private readonly AppDbContext _context;

        public GetServiceCenterByIdHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceCenterDetailDto> Handle(GetServiceCenterByIdQuery request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .Include(sc => sc.Photos)
                .Include(sc => sc.Documents)
                .Include(sc => sc.OperatingHours)
                .Include(sc => sc.ServiceTypes).ThenInclude(st => st.ServiceType)
                .Include(sc => sc.CarBrands).ThenInclude(cb => cb.CarBrand)
                .FirstOrDefaultAsync(sc => sc.Id == request.ServiceCenterId &&
                                           sc.ApprovalStatus == ApprovalStatus.Approved, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            return  ServiceCenterMapper.ToDetailDto(serviceCenter);
        }
    }
}
