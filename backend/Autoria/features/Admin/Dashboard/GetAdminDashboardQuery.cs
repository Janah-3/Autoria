using Autoria.features.Admin.Dashboard.Dtos;
using Autoria.Features.Admin.Dashboard.Dtos;
using MediatR;

namespace Autoria.features.Admin.Dashboard
{
    public record GetAdminDashboardQuery():IRequest<AdminDashboardDto>;
    
}
