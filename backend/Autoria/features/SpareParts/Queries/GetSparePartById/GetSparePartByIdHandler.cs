using Autoria.features.SpareParts.Dtos;
using Autoria.features.SpareParts.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Queries.GetSparePartById
{
    public class GetSparePartByIdHandler : IRequestHandler<GetSparePartByIdQuery, SparePartDetailDto>
    {
        private readonly AppDbContext _db;

        public GetSparePartByIdHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<SparePartDetailDto> Handle(GetSparePartByIdQuery request, CancellationToken cancellationToken)
        {
            var part = await _db.SpareParts
                .Include(sp => sp.Images)
                .Include(sp => sp.Inventories)
                    .ThenInclude(i => i.ServiceCenter)
                .FirstOrDefaultAsync(sp => sp.Id == request.SparePartId && sp.IsActive, cancellationToken)
                ?? throw new NotFoundException("Spare part not found.");

            return SparePartMapper.ToDetailDto(part);
        }
    }
}
