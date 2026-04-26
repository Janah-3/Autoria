namespace Autoria.features.Reviews.Entity
{
    public class ReviewReply
    {
        public Guid Id { get; set; }
        public Guid ReviewId { get; set; }
        public Review Review { get; set; } = default!;
        public string Comment { get; set; } = default!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
