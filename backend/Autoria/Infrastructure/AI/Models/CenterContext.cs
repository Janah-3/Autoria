namespace Autoria.Infrastructure.AI.Models
{
    public record CenterContext(
     int Rank,
     string Name,
     double DistanceKm,
     double Rating,
     List<string> Brands,
     List<string> ServiceTypes
 );

}
