using Autoria.shared.Enums;
using MediatR;

namespace Autoria.features.ServiceCenter.Commands.CreateServiceCenter
{
    public record CreateServiceCenterCommand(
     string UserId,
     string Name,
     string Phone,
     string BusinessEmail,
     int YearEstablished,
     string Description,
     string CommercialRegNo,
     string TaxCardNo,
     string OwnerNationalId,
     string OwnerFullName,
     int NumServiceBays,
     ServiceCenterType Type
 ) : IRequest<Guid>;
}
