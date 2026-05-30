using MediatR;

namespace Autoria.features.ServiceCenter.Commands.SendPromotion
{
    public record SendPromotionCommand(
        Guid ServiceCenterId,
        string Subject,
        string Body
    ) : IRequest<int>;  // returns number of emails sent
}
