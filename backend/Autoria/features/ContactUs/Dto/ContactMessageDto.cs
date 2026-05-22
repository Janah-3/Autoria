namespace Autoria.features.ContactUs.Dto
{
    public class ContactMessageDto
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Subject { get; set; } = default!;
        public string Message { get; set; } = default!;
        public bool IsResolved { get; set; }
        public string? AdminNotes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
