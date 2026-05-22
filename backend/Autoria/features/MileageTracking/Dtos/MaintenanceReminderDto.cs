namespace Autoria.features.MileageTracking.Dtos
{
    public class MaintenanceReminderDto
    {
        public Guid Id { get; set; }
        public Guid CarId { get; set; }
        public string CarPlate { get; set; } = default!;
        public string Title { get; set; } = default!;
        public int MileageThreshold { get; set; }
        public bool IsTriggered { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? TriggeredAt { get; set; }
    }
}
