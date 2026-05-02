using Autoria.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Queries.GetCategories
{
    public class GetCategoriesHandler : IRequestHandler<GetCategoriesQuery, List<string>>
    {
        private readonly AppDbContext _db;

        public GetCategoriesHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<string>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            return await _db.SpareParts
                .Where(sp => sp.IsActive)
                .Select(sp => sp.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync(cancellationToken);
        }
    }
}
