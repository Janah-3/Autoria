using Autoria.features.Admin.Dashboard;
using Autoria.Features.Admin.Dashboard.Dtos;
using Autoria.shared.constants;
using Autoria.shared.Controllers;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Admin
{
    public class AdminController : BaseController
    {

        public AdminController(IMediator mediator) : base(mediator) { }


        [HttpGet]
        [Route("dashboard")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _mediator.Send(new GetAdminDashboardQuery());
            return Success(result);
        }

    }
}
