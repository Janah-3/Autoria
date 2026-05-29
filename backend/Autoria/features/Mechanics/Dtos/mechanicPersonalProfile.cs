using Autoria.shared.Enums;
using NetTopologySuite.Geometries;

namespace Autoria.features.Mechanics.Dtos
{
    public class mechanicPersonalProfile
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public  string PhoneNumber { get; set; }
        public int YearsOfExperience { get; set; }
        public string City { get; set; } = default!;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public double Rating { get; set; }
    }
}
