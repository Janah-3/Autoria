using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.SpareParts.Entities
{
    public class SparePart
    {
        public Guid Id { get; set; }
        public string CreatedById { get; set; } = default!;
        public User CreatedBy { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string Category { get; set; } = default!;
        public string Brand { get; set; } = default!;
        public string Model { get; set; } = default!;
        public DateOnly? ProductionDate { get; set; }
        public string PartNumber { get; set; } = default!;
        public string CountryOfOrigin { get; set; } = default!;
        public string Manufacturer { get; set; } = default!;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<SparePartImage> Images { get; set; } = new List<SparePartImage>();
        public ICollection<Inventory.Entities.Inventory> Inventories { get; set; } = new List<Inventory.Entities.Inventory>();
        public ICollection<SparePartCompatibility> Compatibilities { get; set; } = new List<SparePartCompatibility>();
    }
}
