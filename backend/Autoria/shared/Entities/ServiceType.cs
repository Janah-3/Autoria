using System.ComponentModel.DataAnnotations;

namespace Autoria.shared.Entities
{
    public class ServiceType
    {
        [Key]
        public Guid ServiceTypeId { get; set; }
        public string Name { get; set; } = default!;

    }
}
