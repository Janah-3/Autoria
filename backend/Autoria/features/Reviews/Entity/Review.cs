using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.Reviews.Entity
{
    public class Review
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
        public Guid ServiceCenterId { get; set; }
        public Guid BookingId { get; set; }
        public Booking.Entities.Booking Booking { get; set; } = default!;
        public int Rating { get; set; }
        public string Comment { get; set; } = default!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ReviewReply? Reply { get; set; }
        public ICollection<ReviewPhoto> Photos { get; set; } = new List<ReviewPhoto>();
        public ServiceCenter.Entities.ServiceCenter ServiceCenter { get; set; } = default!;
        public User User { get; set; } = default!;
    }

    public class ReviewPhoto
    {
        public Guid Id { get; set; }
        public Guid ReviewId { get; set; }
        public Review Review { get; set; } = default!;
        public string PhotoUrl { get; set; } = default!;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
