using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.Inventory.Entities
{
    public class InventoryHistory
    {
        public Guid Id { get; set; }
        public Guid InventoryId { get; set; }
        public Inventory Inventory { get; set; } = default!;
        public string ChangedById { get; set; } = default!;
        public User ChangedBy { get; set; } = default!;
        public int PreviousQuantity { get; set; }
        public int NewQuantity { get; set; }
        public decimal PreviousPrice { get; set; }
        public decimal NewPrice { get; set; }
        public string? Reason { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }

}
