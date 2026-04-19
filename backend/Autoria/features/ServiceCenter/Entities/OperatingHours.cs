namespace Autoria.features.ServiceCenter.Entities
{
    public class OperatingHours
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter ServiceCenter { get; set; } = default!;
        public DayOfWeek Day { get; set; }
        public TimeOnly OpenTime { get; set; }
        public TimeOnly CloseTime { get; set; }
        public bool IsClosed { get; set; }
    }
}
