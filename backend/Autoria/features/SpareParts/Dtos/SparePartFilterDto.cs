namespace Autoria.features.SpareParts.Dtos
{
    public class SparePartFilterDto
    {
        public string? Search { get; set; }
        public string? Category { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? PartNumber { get; set; }
        public bool? IsAvailable { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
