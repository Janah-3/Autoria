using Autoria.features.Payments.Enums;

namespace Autoria.features.Payments.Dtos
{
    public class InvoiceDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string ServiceCenterName { get; set; } = default!;
        public string ClientName { get; set; } = default!;
        public string ClientEmail { get; set; } = default!;
        public decimal TotalAmount { get; set; }
        public InvoiceStatus Status { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? IssuedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public List<InvoiceItemDto> Items { get; set; } = new();
        public PaymentDto? Payment { get; set; }
    }
}
