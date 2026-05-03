using System.Security.Claims;
using Autoria.features.Reports.Entity;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;

namespace Autoria.features.Reports.Commands.AddReport
{
    public class AddReportHandler : IRequestHandler<AddReportCommand, Unit>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly AppDbContext _dbContext;

        public AddReportHandler(ICurrentUserService currentUserService, AppDbContext dbContext  )
        {
            _currentUserService = currentUserService;
            _dbContext = dbContext;
            
        }
        public async Task<Unit> Handle(AddReportCommand request, CancellationToken cancellationToken)
        {

            _currentUserService.IsAuthenticated();
           var userId = _currentUserService.GetUserId();

            var report = new Report
            {
                CreatedAt = DateTime.UtcNow,
                Reason = request.Reason,
                ReporterId = userId,

               
            };

            _dbContext.Reports.AddAsync()


            return Unit.Value;



        }
    }
}
