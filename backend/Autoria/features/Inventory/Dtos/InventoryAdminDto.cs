namespace Autoria.features.Inventory.Dtos
{
    public class InventoryAdminDto
    {
        public Guid InventoryId { get; set; }
        public Guid SparePartId { get; set; }
        public string PartName { get; set; } = default!;
        public string PartNumber { get; set; } = default!;
        public string Category { get; set; } = default!;
        public Guid ServiceCenterId { get; set; }
        public string ServiceCenterName { get; set; } = default!;
        public string Governorate { get; set; } = default!;
        public int Quantity { get; set; }
        public bool IsAvailable { get; set; }
        public decimal Price { get; set; }
        public int LowStockThreshold { get; set; }
        public bool IsFlaggedLowStock { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
