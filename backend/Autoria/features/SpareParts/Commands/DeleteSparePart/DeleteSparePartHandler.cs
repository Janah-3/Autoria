using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace Autoria.features.SpareParts.Commands.DeleteSparePart
{
    public class DeleteSparePartHandler : IRequestHandler<DeleteSparePartCommand>
    {
        private readonly AppDbContext _db;

        public DeleteSparePartHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task Handle(DeleteSparePartCommand request, CancellationToken cancellationToken)
        {
            var part = await _db.SpareParts
                .FirstOrDefaultAsync(sp => sp.Id == request.SparePartId, cancellationToken)
                ?? throw new NotFoundException("Spare part not found.");

            if (!part.IsActive)
                throw new BadRequestException("Spare part is already deleted.");

            // Soft delete
            part.IsActive = false;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
