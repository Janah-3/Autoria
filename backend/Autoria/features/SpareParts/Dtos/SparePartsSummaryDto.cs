namespace Autoria.features.SpareParts.Dtos
{
    public class SparePartSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Category { get; set; } = default!;
        public string Brand { get; set; } = default!;
        public string Model { get; set; } = default!;
        public string PartNumber { get; set; } = default!;
        public string? ThumbnailUrl { get; set; }
        public int TotalAvailableCenters { get; set; }
        public decimal? LowestPrice { get; set; }
    }
}
