using Autoria.features.Reports.Commands.AddReport;
using Autoria.features.Reports.Queries.GetAllReports;
using Autoria.features.Reports.Queries.GetReportDetails;
using Autoria.shared.constants;
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

        [Authorize(Roles = Roles.Admin)]
        [HttpGet]
        public async Task<IActionResult> GetAllReports([FromQuery] GetAllReportsQuery query)
        {
            var result = await _mediator.Send(query);
            return Success(result);
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportDetails(Guid id)
        {
            var result = await _mediator.Send(new GetReportDetailsQuery(id));
            return Success(result);
        }
    }
}
