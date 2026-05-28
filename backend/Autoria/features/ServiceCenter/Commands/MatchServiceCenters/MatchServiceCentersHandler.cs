using Autoria.Features.ServiceCenters.MatchServiceCenters;
using Autoria.Features.ServiceCenters.MatchServiceCenters.Dtos;
using Autoria.Infrastructure.AI.Contracts;
using Autoria.Infrastructure.AI.Models;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Autoria.features.ServiceCenter.Commands.MatchServiceCenters
{
    public class MatchServiceCentersHandler : IRequestHandler<MatchServiceCentersCommand, MatchServiceCentersResult>
    {
        private readonly AppDbContext _dbContext;
        private ICurrentUserService _currentUser;
        private readonly IGeminiService _geminiService;

        public MatchServiceCentersHandler(AppDbContext dbContext , ICurrentUserService currentUser , IGeminiService geminiService)
        {
          _dbContext = dbContext;
          _currentUser= currentUser;
          _geminiService = geminiService;
        }
        public async Task<MatchServiceCentersResult> Handle(MatchServiceCentersCommand request, CancellationToken cancellationToken)
        {
            // Step 1: Clamp radius
            var radius = Math.Clamp(request.RadiusKm, 2, 50);

            // Step 2: Resolve car brand if CarId provided
            string? CarBrand = null;

            if (request.CarId.HasValue)
            {
                var carBrand = await _dbContext.Cars.Where(c=> c.CarId == request.CarId)
                    .Select(c => c.Brand.Name)
                    .FirstOrDefaultAsync();
            }

            var availableServiceTypes = await _dbContext.ServiceTypes.Select(st => st.Name)
                .ToListAsync(cancellationToken);

            var intent = await _geminiService.ExtractIntentAsync(request.Issue, availableServiceTypes);



            if (!Enum.TryParse<ServiceCenterType>(
                   intent.ServiceCenterType,
                 true,
                 out var serviceCentertype))
            {
                throw new Exception("Invalid service center type");
            }

            var candidates = await _dbContext.ServiceCenters
          .Where(sc => sc.ApprovalStatus == shared.Enums.ApprovalStatus.Approved)
         .Where(sc => serviceCentertype == ServiceCenterType.Both ||
          sc.Type == serviceCentertype)
          .Where(sc => intent.ServiceType == null ||sc.ServiceTypes.Any(st => st.ServiceType.Name == intent.ServiceType))
            .Where(sc => CarBrand == null ||  sc.CarBrands.Any(b => b.CarBrand.Name == CarBrand))
          .Select(sc => new
          {
              sc.Id,
              sc.Name,
              sc.Location,
              sc.Address,
              sc.Rating,
              Brands = sc.CarBrands.Select(b => b.CarBrand.Name).ToList(),
              ServiceTypes = sc.ServiceTypes.Select(st => st.ServiceType.Name).ToList()
          })
          .ToListAsync(cancellationToken);


           
            var scored = candidates
                .Select(sc =>
                {
                    var distanceKm = CalculateDistance(
                        request.Latitude, request.Longitude,
                        sc.Location.X, sc.Location.Y);

                    if (distanceKm > radius) return null;

                    var brandMatch = CarBrand != null && sc.Brands.Contains(CarBrand) ? 1.0 : 0.0;
                    var score = (1.0 / (distanceKm + 0.1)) * 0.4
                              + (sc.Rating / 5.0) * 0.4
                              + brandMatch * 0.2;

                    return new
                    {
                        sc.Id,
                        sc.Name,
                        sc.Brands,
                        sc.ServiceTypes,
                        sc.Rating,
                        DistanceKm = distanceKm,
                        Score = score
                    };
                })
                .Where(x => x != null).OrderByDescending(x => x!.Score)
                .Take(5).ToList();


            var centerContexts = scored.Select((sc, index) => new CenterContext(
           Rank: index + 1,
           Name: sc!.Name,
           DistanceKm: sc.DistanceKm,
           Rating: sc.Rating,
           Brands: sc.Brands,
           ServiceTypes: sc.ServiceTypes
       )).ToList();

            // Step 8: Generate explanations
            var explanations = await _geminiService.centerExplanationsAsync(
                request.Issue,
                intent,
                centerContexts);

            // Step 9: Merge and return
            var matches = scored.Select((sc, index) =>
            {
                var explanation = explanations.FirstOrDefault(e => e.Rank == index + 1);
                return new MatchedServiceCenterDto(
                    ServiceCenterId: sc!.Id,
                    Name: sc.Name,
                    DistanceKm: Math.Round(sc.DistanceKm, 1),
                    Rating: sc.Rating,
                    ServiceTypes: sc.ServiceTypes,
                    Explanation: explanation?.Explanation ?? string.Empty
                );
            }).ToList();

            return new MatchServiceCentersResult(
                Matches: matches,
                InterpretedIssue: new InterpretedIssueDto(
                    ServiceCenterType: intent.ServiceCenterType,
                    ServiceType: intent.ServiceType,
                    Urgency: intent.Urgency
                )
            );

        }





        private static double CalculateDistance(
            double lat1, double lon1,
            double lat2, double lon2)
        {
            const double R = 6371;
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }

        private static double ToRad(double deg) => deg * Math.PI / 180;
    }
}



