using System;
using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Enums;

namespace Autoria.features.Car.Entity
{
    public class Car 
    {
        public Guid CarId { get; set; }
        public string Make { get; set; } = default!;
        public string Model { get; set; } = default!;
        public int Year { get; set; }
        public string Vin { get; set; } = default!;
        public string LicensePlate { get; set; } = default!;
        public int Mileage { get; set; }
        public Guid? BrandId { get; set; }
        public CarBrand Brand { get; set; }
        public string Color { get; set; } = default!;
        public Transmission Transmission { get; set; }
        public FuelType FuelType { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; } = default!;
        public User User { get; set; } = default!;



    }
}
