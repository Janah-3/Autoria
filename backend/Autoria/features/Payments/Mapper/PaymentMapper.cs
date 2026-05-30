using Autoria.features.Payments.Dtos;
using Autoria.features.Payments.Entities;

namespace Autoria.features.Payments.Mapper
{
    public static class PaymentMapper
    {
        public static InvoiceDto ToDto(Invoice inv) => new()
        {
            Id = inv.Id,
            BookingId = inv.BookingId,
            ServiceCenterName = inv.ServiceCenter.Name,
            ClientName = inv.Client.FullName,
            ClientEmail = inv.Client.Email!,
            TotalAmount = inv.TotalAmount,
            Status = inv.Status,
            Notes = inv.Notes,
            CreatedAt = inv.CreatedAt,
            IssuedAt = inv.IssuedAt,
            PaidAt = inv.PaidAt,
            Items = inv.Items.Select(ToItemDto).ToList(),
            Payment = inv.Payment is not null ? ToPaymentDto(inv.Payment) : null
        };

        public static InvoiceItemDto ToItemDto(InvoiceItem item) => new()
        {
            Id = item.Id,
            Description = item.Description,
            UnitPrice = item.UnitPrice,
            Quantity = item.Quantity,
            TotalPrice = item.UnitPrice * item.Quantity
        };

        public static PaymentDto ToPaymentDto(Payment p) => new()
        {
            Id = p.Id,
            InvoiceId = p.InvoiceId,
            BookingId = p.BookingId,
            UserId = p.UserId,
            Method = p.Method,
            Status = p.Status,
            Amount = p.Amount,
            TransactionId = p.TransactionId,
            Notes = p.Notes,
            RefundReason = p.RefundReason,
            CreatedAt = p.CreatedAt,
            PaidAt = p.PaidAt,
            RefundedAt = p.RefundedAt
        };
    }
}
