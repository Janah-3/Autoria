using Autoria.features.MileageTracking.Dtos;

namespace Autoria.features.MileageTracking.Mappers
{
    public static class MileageMapper
    {
        public static MileageEntryDto ToDto(Entities.MileageEntry e) => new()
        {
            Id = e.Id,
            CarId = e.CarId,
            CarPlate = e.Car.LicensePlate,
            Mileage = e.Mileage,
            Notes = e.Notes,
            LoggedAt = e.LoggedAt
        };

        public static MaintenanceReminderDto ToDto(Entities.MaintenanceReminder r) => new()
        {
            Id = r.Id,
            CarId = r.CarId,
            CarPlate = r.Car.LicensePlate,
            Title = r.Title,
            MileageThreshold = r.MileageThreshold,
            IsTriggered = r.IsTriggered,
            IsActive = r.IsActive,
            CreatedAt = r.CreatedAt,
            TriggeredAt = r.TriggeredAt
        };
    }
}
