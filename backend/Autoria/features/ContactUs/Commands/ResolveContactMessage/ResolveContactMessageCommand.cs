using MediatR;

namespace Autoria.features.ContactUs.Commands.ResolveContactMessage
{
    public record ResolveContactMessageCommand(
        Guid MessageId,
        string? AdminNotes
    ) : IRequest;
}
