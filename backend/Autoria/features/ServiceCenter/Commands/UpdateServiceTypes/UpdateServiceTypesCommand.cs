using MediatR;

namespace Autoria.features.ServiceCenter.Commands.UpdateServiceTypes
{
    public record UpdateServiceTypesCommand(
    string UserId,
    List<Guid> ServiceTypeIds
) : IRequest<Unit>;
}
