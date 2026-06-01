namespace Autoria.features.SpareParts.Dtos
{
    public class CreateSparePartFormRequest
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

        /// <summary>Image files — field name: "images"</summary>
        public IFormFileCollection? Images { get; set; }

        /// <summary>
        /// JSON string for car compatibilities.
        /// Example: [{"carMake":"Toyota","carModel":"Corolla","yearFrom":2018,"yearTo":2023}]
        /// </summary>
        public string? CompatibilitiesJson { get; set; }
    }
}
