using System.Net.Http;
using System.Runtime;
using System.Text.Json;
using Autoria.Infrastructure.AI.Contracts;
using Autoria.Infrastructure.AI.Models;
using Microsoft.Extensions.Options;

namespace Autoria.Infrastructure.AI
{
    public class GeminiService : IGeminiService
    {
        private readonly GeminiSettings _settings;
        private readonly HttpClient _httpClient;

        public GeminiService(HttpClient httpClient , IOptions<GeminiSettings> settings)
        {
            _settings = settings.Value;
            _httpClient = httpClient;

            Console.WriteLine($"Using Gemini key: '{_settings.ApiKey}' (length: {_settings.ApiKey?.Length})");

        }


        public async Task<List<CenterExplanation>> centerExplanationsAsync(
     string issue,
     ServiceIssueIntent intent,
     List<CenterContext> centers)
        {
            var centerLines = centers.Select(c =>
                $"{c.Rank}. {c.Name}, {c.DistanceKm:F1}km away, " +
                $"rating {c.Rating:F1}/5, " +
                $"supports: {string.Join(", ", c.Brands)}, " +
                $"services: {string.Join(", ", c.ServiceTypes)}"
            );

            var prompt = $$"""
        You are an automotive assistant for Egypt.
        A car owner described their issue as: "{{issue}}"
        Interpreted as: {intent.ServiceCenterType}, urgency: {{intent.Urgency}}, keywords: {{string.Join(", ", intent.Keywords)}}

        Here are the top service centers ranked by distance and rating:
        {{string.Join("\n", centerLines)}}

        For each center, write one concise sentence (max 20 words) explaining why it suits the user's issue.
        IMPORTANT: Respond in the same language the user used in their issue description.
        Respond ONLY in valid JSON, no markdown:
        [
          { "rank": 1, "explanation": "..." },
          { "rank": 2, "explanation": "..." }
        ]
        """;

            var json = await CallGeminiAsync(prompt);

            var clean = json
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            return JsonSerializer.Deserialize<List<CenterExplanation>>(clean, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            })!;
        }
        public async Task<ServiceIssueIntent> ExtractIntentAsync(string issue, List<string> availableServiceTypes)
        {
            var serviceTypeOptions = string.Join(", ", availableServiceTypes);



            var prompt = $$"""
            You are an automotive service assistant for Egypt.
            A car owner described their issue as: "{{issue}}"
            
            Available service types in our system: {{serviceTypeOptions}}
            
            Extract the following and respond ONLY in valid JSON, no markdown, no explanation:
            {
             
                      "service_center_type": "maintenance" | "parts_store" | "both",
              "service_type": one of the exact available service types above or null if none fit confidently,
              "urgency": "low" | "medium" | "high",
              "keywords": ["keyword1", "keyword2"]
            }
            
            Rules:
            - service_center_type "parts_store" only if the user needs to buy a part themselves
            - service_center_type "maintenance" if they need repair or inspection work done
            - service_center_type "both" if unclear or both apply
            - service_type MUST exactly match one of the available service types or be null
            - urgency "high" if safety-critical (brakes, steering, engine failure)
            - keywords must be in English regardless of input language, 2-4 technical keywords only
            """;


            var json =  await CallGeminiAsync(prompt);

            var clean = json
       .Replace("```json", "")
       .Replace("```", "")
       .Trim();

            using var doc = JsonDocument.Parse(clean);
            var root = doc.RootElement;

            return new ServiceIssueIntent(
                ServiceCenterType: root.GetProperty("service_center_type").GetString()!,
                ServiceType: root.TryGetProperty("service_type", out var st) && st.ValueKind != JsonValueKind.Null
                    ? st.GetString()
                    : null,
                Urgency: root.GetProperty("urgency").GetString()!,
                Keywords: root.GetProperty("keywords")
                             .EnumerateArray()
                             .Select(k => k.GetString()!)
                             .ToList()
            );
        }




        private async Task<string> CallGeminiAsync(string prompt)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_settings.Model}:generateContent?key={_settings.ApiKey}";

            var requestBody = new
            {
                contents = new[]
                {
            new
            {
                parts = new[]
                {
                    new { text = prompt }
                }
            }
        }
            };

            var response = await _httpClient.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API error {response.StatusCode}: {errorBody}");
            }

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();

            return result
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString()!;
        }
    }
}
