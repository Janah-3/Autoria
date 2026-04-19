using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Enums;

namespace Autoria.features.Cars.Dtos
{
    public class CarDto
    {
        public string Make { get; set; } = default!;
        public string Model { get; set; } = default!;
        public int Year { get; set; }
        public string Vin { get; set; } = default!;
        public string LicensePlate { get; set; } = default!;
        public int Mileage { get; set; }
        public string Color { get; set; } = default!;
        public Transmission Transmission { get; set; }
        public FuelType FuelType { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
      
    }
}
