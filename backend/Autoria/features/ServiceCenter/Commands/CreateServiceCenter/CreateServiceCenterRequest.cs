using Autoria.shared.Enums;

namespace Autoria.features.ServiceCenter.Commands.CreateServiceCenter
{
    public record CreateServiceCenterRequest(
    string Name,
    string Governorate,
    string District,
    string StreetAddress,
    string Phone,
    string BusinessEmail,
    int YearEstablished,
    string Description,
    string CommercialRegNo,
    string TaxCardNo,
    string OwnerNationalId,
    string OwnerFullName,
    int NumServiceBays,
    ServiceCenterType Type,
    double Latitude,
    double Longitude
);
}
