using Autoria.features.Reports.Commands.AddReport;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Reports
{
    public class ReportsController : BaseController
    {

        public ReportsController(IMediator mediator) : base(mediator) { }


        public async Task<IActionResult> AddReport(AddReportCommand command)
        {
            
            await _mediator.Send(command);

            return Success("report added successfully");
        }
       
    }
}
