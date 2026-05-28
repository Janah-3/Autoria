using Autoria.Features.Mechanics.Entities;
using Autoria.shared.Entities;

public class MechanicSpecialization
{
    public Guid MechanicProfileId { get; set; }
    public MechanicProfile MechanicProfile { get; set; } = default!;

    public Guid ServiceTypeId { get; set; }
    public ServiceType ServiceType { get; set; } = default!;
}