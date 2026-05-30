namespace Autoria.features.ServiceCenter.Entities
{
    public class PromotionLog
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter ServiceCenter { get; set; } = default!;
        public string Subject { get; set; } = default!;
        public int RecipientCount { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
