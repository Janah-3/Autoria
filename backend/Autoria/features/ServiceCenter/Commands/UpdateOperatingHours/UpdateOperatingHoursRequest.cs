namespace Autoria.features.ServiceCenter.Commands.UpdateOperatingHours
{
    public record UpdateOperatingHoursRequest(
    List<OperatingHoursItemRequest> OperatingHours
);

    public record OperatingHoursItemRequest(
        DayOfWeek Day,
        TimeOnly OpenTime,
        TimeOnly CloseTime,
        bool IsClosed
    );
}
