namespace Autoria.features.MileageTracking.Dtos
{
    public class MileageEntryDto
    {
        public Guid Id { get; set; }
        public Guid CarId { get; set; }
        public string CarPlate { get; set; } = default!;
        public int Mileage { get; set; }
        public string? Notes { get; set; }
        public DateTime LoggedAt { get; set; }
    }
}
