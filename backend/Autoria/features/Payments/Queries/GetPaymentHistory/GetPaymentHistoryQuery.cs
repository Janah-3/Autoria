using Autoria.features.Payments.Dtos;
using Autoria.features.Payments.Enums;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Payments.Queries.GetPaymentHistory
{
    public record GetPaymentHistoryQuery(
        Guid? ServiceCenterId = null,
        PaymentMethod? Method = null,
        PaymentStatus? Status = null,
        DateTime? DateFrom = null,
        DateTime? DateTo = null,
        int Page = 1,
        int PageSize = 10,
        bool CurrentUserOnly = false
    ) : IRequest<PagedResponse<PaymentDto>>;
}
