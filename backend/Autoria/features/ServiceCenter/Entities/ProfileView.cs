namespace Autoria.features.ServiceCenter.Entities
{
    public class ProfileView
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter ServiceCenter { get; set; } = default!;
        public string? UserId { get; set; }    // null if anonymous
        public string? IpAddress { get; set; }
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }

}
