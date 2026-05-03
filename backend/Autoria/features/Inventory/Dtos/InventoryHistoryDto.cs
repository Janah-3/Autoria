namespace Autoria.features.Inventory.Dtos
{
    public class InventoryHistoryDto
    {
        public Guid Id { get; set; }
        public string ChangedByName { get; set; } = default!;
        public int PreviousQuantity { get; set; }
        public int NewQuantity { get; set; }
        public decimal PreviousPrice { get; set; }
        public decimal NewPrice { get; set; }
        public string? Reason { get; set; }
        public DateTime ChangedAt { get; set; }
    }
}
