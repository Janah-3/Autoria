namespace Autoria.features.ServiceCenter.Dtos
{
    public class OperatingHoursDto
    {
        public DayOfWeek Day { get; set; }
        public TimeOnly OpenTime { get; set; }
        public TimeOnly CloseTime { get; set; }
        public bool IsClosed { get; set; }
    }
}
