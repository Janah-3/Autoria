using Autoria.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetCarBrandsHandler : IRequestHandler<GetCarBrandsQuery, List<CarBrandDto>>
{
    private readonly AppDbContext _context;

    public GetCarBrandsHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CarBrandDto>> Handle(GetCarBrandsQuery request, CancellationToken cancellationToken)
    {
        return await _context.CarBrands
            .Select(cb => new CarBrandDto
            {
                Id = cb.Id,
                Name = cb.Name
            })
            .ToListAsync(cancellationToken);
    }
}