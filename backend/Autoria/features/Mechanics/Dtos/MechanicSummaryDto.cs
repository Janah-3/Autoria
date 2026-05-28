namespace Autoria.Features.Mechanics.Dtos
{
    public class MechanicSummaryDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = default!;
        public string ProfilePhotoUrl { get; set; } = default!;
        public int YearsOfExperience { get; set; }
        public string City { get; set; } = default!;
        public double Rating { get; set; }
        public List<string> Specializations { get; set; } = [];
        public double? DistanceInKm { get; set; }
    }
}