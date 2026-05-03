namespace Autoria.features.SpareParts.Entities
{
    public class SparePartImage
    {
        public Guid Id { get; set; }
        public Guid SparePartId { get; set; }
        public SparePart SparePart { get; set; } = default!;
        public string Url { get; set; } = default!;
    }
}
