using Autoria.features.Reports.Commands.AddReport;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Reports
{
    public class ReportsController : BaseController
    {

        public ReportsController(IMediator mediator) : base(mediator) { }


        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddReport([FromBody] AddReportCommand command)
        {
            await _mediator.Send(command);
            return Success("Report submitted successfully");
        }

    }
}
