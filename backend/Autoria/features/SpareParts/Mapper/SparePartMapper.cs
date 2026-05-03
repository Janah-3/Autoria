using Autoria.features.Inventory.Dtos;
using Autoria.features.Inventory.Mapper;
using Autoria.features.SpareParts.Dtos;
using Autoria.features.SpareParts.Entities;

namespace Autoria.features.SpareParts.Mapper
{
    public static class SparePartMapper
    {
        public static SparePartSummaryDto ToSummaryDto(SparePart sp) => new()
        {
            Id = sp.Id,
            Name = sp.Name,
            Category = sp.Category,
            Brand = sp.Brand,
            Model = sp.Model,
            PartNumber = sp.PartNumber,
            ThumbnailUrl = sp.Images.FirstOrDefault()?.Url,
            TotalAvailableCenters = sp.Inventories.Count(i => i.IsAvailable && i.Quantity > 0),
            LowestPrice = sp.Inventories.Any(i => i.IsAvailable && i.Quantity > 0)
                                        ? sp.Inventories.Where(i => i.IsAvailable && i.Quantity > 0).Min(i => i.Price)
                                        : null
        };

        public static SparePartDetailDto ToDetailDto(SparePart sp) => new()
        {
            Id = sp.Id,
            Name = sp.Name,
            Category = sp.Category,
            Brand = sp.Brand,
            Model = sp.Model,
            ProductionDate = sp.ProductionDate,
            PartNumber = sp.PartNumber,
            CountryOfOrigin = sp.CountryOfOrigin,
            Manufacturer = sp.Manufacturer,
            Description = sp.Description,
            CreatedAt = sp.CreatedAt,
            Images = sp.Images.Select(i => i.Url).ToList(),
            Availability = sp.Inventories.Select(i => InventoryMapper.ToAvailabilityDto(i)).ToList()
        };

        public static ReservationDto ToReservationDto(PartReservation r) => new()
        {
            Id = r.Id,
            PartName = r.SparePart.Name,
            PartNumber = r.SparePart.PartNumber,
            ServiceCenterName = r.ServiceCenter.Name,
            BookingId = r.BookingId,
            Quantity = r.Quantity,
            UnitPrice = r.UnitPrice,
            TotalPrice = r.TotalPrice,
            Status = r.Status,
            ReservedAt = r.ReservedAt,
            ExpiresAt = r.ExpiresAt,
            CancellationReason = r.CancellationReason
        };
    }
}
