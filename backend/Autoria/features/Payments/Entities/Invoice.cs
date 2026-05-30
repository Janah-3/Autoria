using Autoria.features.Payments.Enums;
using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.Payments.Entities
{
    public class Invoice
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter.Entities.ServiceCenter ServiceCenter { get; set; } = default!;
        public string ClientId { get; set; } = default!;
        public User Client { get; set; } = default!;
        public decimal TotalAmount { get; set; }
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? IssuedAt { get; set; }
        public DateTime? PaidAt { get; set; }

        // Navigation
        public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
        public Payment? Payment { get; set; }
    }
}
