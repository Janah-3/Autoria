namespace Autoria.features.ServiceCenter.Dtos
{
    public record UpdateServiceCenterLocationRequest(
     double Latitude,
     double Longitude,
     string Address
 );
}
