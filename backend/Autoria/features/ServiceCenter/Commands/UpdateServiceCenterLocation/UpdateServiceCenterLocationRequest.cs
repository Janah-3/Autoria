namespace Autoria.features.ServiceCenter.Commands.UpdateServiceCenterLocation
{
    public record UpdateServiceCenterLocationRequest(
    double Latitude,
    double Longitude,
    string Governorate,
    string District,
    string Address
);
}
