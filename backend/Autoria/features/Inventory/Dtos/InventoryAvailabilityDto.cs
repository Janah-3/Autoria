namespace Autoria.features.Inventory.Dtos
{
    public class InventoryAvailabilityDto
    {
        public Guid InventoryId { get; set; }
        public Guid ServiceCenterId { get; set; }
        public string ServiceCenterName { get; set; } = default!;
        public string Governorate { get; set; } = default!;
        public string District { get; set; } = default!;
        public int Quantity { get; set; }
        public bool IsAvailable { get; set; }
        public decimal Price { get; set; }
    }
}
