using MediatR;

namespace Autoria.features.SpareParts.Queries.GetCategories
{
    public record GetCategoriesQuery : IRequest<List<string>>;
}
