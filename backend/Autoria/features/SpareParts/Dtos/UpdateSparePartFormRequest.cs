namespace Autoria.features.SpareParts.Dtos
{
    public class UpdateSparePartFormRequest
    {
        public string Name { get; set; } = default!;
        public string Category { get; set; } = default!;
        public string Brand { get; set; } = default!;
        public string Model { get; set; } = default!;
        public DateOnly? ProductionDate { get; set; }
        public string PartNumber { get; set; } = default!;
        public string CountryOfOrigin { get; set; } = default!;
        public string Manufacturer { get; set; } = default!;
        public string? Description { get; set; }

        /// <summary>New images to upload — field name: "newImages"</summary>
        public IFormFileCollection? NewImages { get; set; }

        /// <summary>JSON array of existing image URLs to delete. Example: ["/uploads/spare-parts/abc.jpg"]</summary>
        public string? ImageUrlsToDeleteJson { get; set; }

        /// <summary>If true, all existing images are replaced with NewImages</summary>
        public bool ReplaceAllImages { get; set; } = false;
    }
}
