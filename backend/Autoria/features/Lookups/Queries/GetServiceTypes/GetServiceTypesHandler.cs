using Autoria.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetServiceTypesHandler : IRequestHandler<GetServiceTypesQuery, List<ServiceTypeDto>>
{
    private readonly AppDbContext _context;

    public GetServiceTypesHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceTypeDto>> Handle(GetServiceTypesQuery request, CancellationToken cancellationToken)
    {
        return await _context.ServiceTypes
            .Select(st => new ServiceTypeDto
            {
                Id = st.ServiceTypeId,
                Name = st.Name
            })
            .ToListAsync(cancellationToken);
    }
}