namespace Autoria.features.Owner.Dashboard.Dtos
{
    public class ActivityItemDto
    {
        public string Type { get; set; } = default!;    // NewBooking | NewReview | BookingCancelled
        public string Message { get; set; } = default!;
        public Guid? ReferenceId { get; set; }          // bookingId or reviewId
        public DateTime OccurredAt { get; set; }
    }
}
