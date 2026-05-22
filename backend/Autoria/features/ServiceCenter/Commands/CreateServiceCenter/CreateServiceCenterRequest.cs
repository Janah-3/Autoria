using Autoria.shared.Enums;

namespace Autoria.features.ServiceCenter.Commands.CreateServiceCenter
{
    public record CreateServiceCenterRequest(
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
);
}
