using Autoria.features.Booking.Dtos;

namespace Autoria.features.Booking.Mapper
{
    public static class BookingMapper
    {
        public static BookingDetailDto ToDetailDto(Entities.Booking b) => new()
        {
            Id = b.Id,
            UserId = b.UserId,
            UserName = b.User.FullName,
            CarId = b.CarId,
            CarMake = b.Car.Make,
            CarModel = b.Car.Model,
            CarYear = b.Car.Year,
            CarLicensePlate = b.Car.LicensePlate,
            CarColor = b.Car.Color,
            CarMileage = b.Car.Mileage,
            ServiceCenterId = b.ServiceCenterId,
            ServiceCenterName = b.ServiceCenter.Name,
            ServiceTypeId = b.ServiceTypeId,
            ServiceTypeName = b.ServiceType.Name,
            Status = b.Status,
            Appointment = b.Appointment,
            Notes = b.Notes,
            TotalPrice = b.TotalPrice,
            CancellationReason = b.CancellationReason,
            CompletedAt = b.CompletedAt,
            CreatedAt = b.CreatedAt
        };

        public static BookingSummaryDto ToSummaryDto(Entities.Booking b) => new()
        {
            Id = b.Id,
            ServiceCenterName = b.ServiceCenter.Name,
            ServiceTypeName = b.ServiceType.Name,
            CarLicensePlate = b.Car.LicensePlate,
            Status = b.Status,
            Appointment = b.Appointment,
            TotalPrice = b.TotalPrice,
            CreatedAt = b.CreatedAt
        };

        public static BookingSummaryAdminDto ToAdminSummaryDto(Entities.Booking b) => new()
        {
            Id = b.Id,
            UserName = b.User.FullName,
            UserEmail = b.User.Email!,
            ServiceCenterName = b.ServiceCenter.Name,
            ServiceTypeName = b.ServiceType.Name,
            CarLicensePlate = b.Car.LicensePlate,
            Status = b.Status,
            Appointment = b.Appointment,
            TotalPrice = b.TotalPrice,
            CreatedAt = b.CreatedAt
        };
    }
}
