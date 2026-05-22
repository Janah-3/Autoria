using Autoria.features.ContactUs.Dto;
using Autoria.features.ContactUs.Mappers;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ContactUs.Queries.GetContactMessages
{
    public class GetContactMessagesHandler : IRequestHandler<GetContactMessagesQuery, PagedResponse<ContactMessageDto>>
    {
        private readonly AppDbContext _db;

        public GetContactMessagesHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResponse<ContactMessageDto>> Handle(GetContactMessagesQuery request, CancellationToken cancellationToken)
        {
            var query = _db.ContactMessages.AsQueryable();

            if (request.IsResolved.HasValue)
                query = query.Where(m => m.IsResolved == request.IsResolved.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(m => m.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<ContactMessageDto>(
                items.Select(ContactMessageMapper.ToDto).ToList(),
                totalCount,
                request.Page,
                request.PageSize);
        }
    }
}
