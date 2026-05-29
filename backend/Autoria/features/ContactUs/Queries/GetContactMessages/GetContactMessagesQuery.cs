using Autoria.features.ContactUs.Dto;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.ContactUs.Queries.GetContactMessages
{
    public record GetContactMessagesQuery(
        bool? IsResolved = null,
        int Page = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<ContactMessageDto>>;
}
