using MediatR;

namespace Autoria.features.ServiceCenter.Commands.UpdateCarBrands
{
    public record UpdateCarBrandsCommand(
     string UserId,
     List<Guid> CarBrandIds
 ) : IRequest<Unit>;
}
