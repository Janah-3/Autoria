namespace Autoria.features.SpareParts.Dtos
{
    public class SparePartDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Category { get; set; } = default!;
        public string Brand { get; set; } = default!;
        public string Model { get; set; } = default!;
        public DateOnly? ProductionDate { get; set; }
        public string PartNumber { get; set; } = default!;
        public string CountryOfOrigin { get; set; } = default!;
        public string Manufacturer { get; set; } = default!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Images { get; set; } = new();
        public List<Inventory.Dtos.InventoryAvailabilityDto> Availability { get; set; } = new();
    }
}
