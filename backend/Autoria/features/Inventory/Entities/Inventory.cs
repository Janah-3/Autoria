using Autoria.features.SpareParts.Entities;

namespace Autoria.features.Inventory.Entities
{
    public class Inventory
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter.Entities.ServiceCenter ServiceCenter { get; set; } = default!;
        public Guid SparePartId { get; set; }
        public SparePart SparePart { get; set; } = default!;
        public int Quantity { get; set; }
        public bool IsAvailable { get; set; } = true;
        public decimal Price { get; set; }
        public int LowStockThreshold { get; set; } = 5;
        public bool IsFlaggedLowStock { get; set; } = false;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<InventoryHistory> History { get; set; } = new List<InventoryHistory>();
    }
}
