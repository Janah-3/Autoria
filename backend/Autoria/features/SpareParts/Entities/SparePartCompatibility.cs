using MediatR;

namespace Autoria.features.SpareParts.Entities
{
    public class SparePartCompatibility
    {
        public Guid Id { get; set; }
        public Guid SparePartId { get; set; }
        public SparePart SparePart { get; set; } = default!;
        public string CarMake { get; set; } = default!;
        public string CarModel { get; set; } = default!;
        public int? YearFrom { get; set; }   // compatible from this year
        public int? YearTo { get; set; }     // compatible to this year
    }
}
