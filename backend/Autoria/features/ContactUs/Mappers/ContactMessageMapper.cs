using Autoria.features.ContactUs.Dto;

namespace Autoria.features.ContactUs.Mappers
{
    public static class ContactMessageMapper
    {
        public static ContactMessageDto ToDto(Entity.ContactMessage m) => new()
        {
            Id = m.Id,
            UserId = m.UserId,
            FullName = m.FullName,
            Email = m.Email,
            Subject = m.Subject,
            Message = m.Message,
            IsResolved = m.IsResolved,
            AdminNotes = m.AdminNotes,
            CreatedAt = m.CreatedAt,
            ResolvedAt = m.ResolvedAt
        };
    }
}
