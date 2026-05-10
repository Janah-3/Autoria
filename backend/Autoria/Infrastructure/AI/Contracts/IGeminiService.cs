using Autoria.Infrastructure.AI.Models;

namespace Autoria.Infrastructure.AI.Contracts
{
    public interface IGeminiService
    {
        Task<ServiceIssueIntent> ExtractIntentAsync(string issue ,List<string> availableServiceTypes);

        Task<List<CenterExplanation>> centerExplanationsAsync(
              string issue,
        ServiceIssueIntent intent,
        List<CenterContext> centers
            );
    }
}
