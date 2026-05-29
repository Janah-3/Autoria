using Autoria.features.Booking;

namespace Autoria.features.Owner.Dashboard.Dtos
{
    public class TodayAppointmentDto
    {
        public Guid BookingId { get; set; }
        public TimeOnly AppointmentTime { get; set; }
        public string ClientName { get; set; } = default!;
        public string ServiceTypeName { get; set; } = default!;
        public string CarMake { get; set; } = default!;
        public string CarModel { get; set; } = default!;
        public BookingStatus Status { get; set; }
    }
}
