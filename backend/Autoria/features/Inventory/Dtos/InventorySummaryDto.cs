namespace Autoria.features.Inventory.Dtos
{
    public class InventorySummaryDto
    {
        public Guid InventoryId { get; set; }
        public Guid SparePartId { get; set; }
        public string PartName { get; set; } = default!;
        public string PartNumber { get; set; } = default!;
        public string Category { get; set; } = default!;
        public string Brand { get; set; } = default!;
        public string? ThumbnailUrl { get; set; }
        public int Quantity { get; set; }
        public bool IsAvailable { get; set; }
        public decimal Price { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
