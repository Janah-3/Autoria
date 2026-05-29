using MediatR;

namespace Autoria.features.ContactUs.Commands.SubmitContactUs
{
    public record SubmitContactUsCommand(
        string FullName,
        string Email,
        string Subject,
        string Message
    ) : IRequest<Guid>;
}
