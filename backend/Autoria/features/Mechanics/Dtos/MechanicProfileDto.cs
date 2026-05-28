namespace Autoria.Features.Mechanics.Dtos
{
    public class MechanicProfileDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = default!;
        public string PhoneNumber { get; set; } = default!;
        public string ProfilePhotoUrl { get; set; } = default!;
        public int YearsOfExperience { get; set; }
        public string City { get; set; } = default!;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double Rating { get; set; }
        public string ApprovalStatus { get; set; } = default!;
        public List<string> Specializations { get; set; } = [];
        public DateTime CreatedAt { get; set; }
    }
}