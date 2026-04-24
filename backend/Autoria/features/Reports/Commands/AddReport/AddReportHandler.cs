using Autoria.Infrastructure.Persistence;
using MediatR;

namespace Autoria.features.Reports.Commands.AddReport
{
    public class AddReportHandler : IRequestHandler<AddReportCommand, Unit>
    {
        private readonly IHttpContextAccessor _httpContext;
        private readonly AppDbContext _dbContext;

        public AddReportHandler(IHttpContextAccessor httpContext, AppDbContext dbContext )
        {
            _httpContext = httpContext;
            _dbContext = dbContext;
            
        }
        public Task<Unit> Handle(AddReportCommand request, CancellationToken cancellationToken)
        {

            var context = _httpContext.HttpContext;

            if (context)
            {


            }


        }
    }
}
