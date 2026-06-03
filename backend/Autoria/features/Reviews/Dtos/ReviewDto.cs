namespace Autoria.features.Reviews.Dtos
{
    /// <summary>Returned when a user views their own reviews.</summary>
    public class ReviewDto
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public string ServiceCenterName { get; set; } = default!;
        public Guid BookingId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public List<string> Photos { get; set; } = new();
        public ReviewReplyDto? Reply { get; set; }
    }
    /// <summary>Returned in public / owner listing of a service center's reviews.</summary>
    public class ReviewWithAuthorDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string AuthorName { get; set; } = default!;
        public int Rating { get; set; }
        public string Comment { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public List<string> Photos { get; set; } = new();
        public ReviewReplyDto? Reply { get; set; }
    }

    /// <summary>Owner reply attached to a review.</summary>
    public class ReviewReplyDto
    {
        public Guid Id { get; set; }
        public string Comment { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>Aggregate result for a service center's reviews page.</summary>
    public class ServiceCenterReviewsDto
    {
        public Guid ServiceCenterId { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        /// <summary>Key = star count (1–5), Value = number of reviews with that rating.</summary>
        public Dictionary<int, int> RatingBreakdown { get; set; } = new();
        public List<ReviewWithAuthorDto> Reviews { get; set; } = new();
    }
}
