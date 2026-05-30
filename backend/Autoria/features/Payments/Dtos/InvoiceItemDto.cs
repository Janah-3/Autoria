namespace Autoria.features.Payments.Dtos
{
    public class InvoiceItemDto
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = default!;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
