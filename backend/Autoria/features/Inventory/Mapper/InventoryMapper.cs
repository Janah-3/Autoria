using Autoria.features.Inventory.Dtos;
using Autoria.features.Inventory.Entities;

namespace Autoria.features.Inventory.Mapper
{
    public static class InventoryMapper
    {
        public static InventoryAvailabilityDto ToAvailabilityDto(Entities.Inventory inv) => new()
        {
            InventoryId = inv.Id,
            ServiceCenterId = inv.ServiceCenterId,
            ServiceCenterName = inv.ServiceCenter.Name,
            Governorate = inv.ServiceCenter.Governorate,
            District = inv.ServiceCenter.District,
            Quantity = inv.Quantity,
            IsAvailable = inv.IsAvailable && inv.Quantity > 0,
            Price = inv.Price
        };
        public static InventorySummaryDto ToInventorySummaryDto(Entities.Inventory inv) => new()
        {
            InventoryId = inv.Id,
            SparePartId = inv.SparePartId,
            PartName = inv.SparePart.Name,
            PartNumber = inv.SparePart.PartNumber,
            Category = inv.SparePart.Category,
            Brand = inv.SparePart.Brand,
            ThumbnailUrl = inv.SparePart.Images.FirstOrDefault()?.Url,
            Quantity = inv.Quantity,
            IsAvailable = inv.IsAvailable,
            Price = inv.Price,
            UpdatedAt = inv.UpdatedAt
        };
        public static InventoryAdminDto ToInventoryAdminDto(Entities.Inventory inv) => new()
        {
            InventoryId = inv.Id,
            SparePartId = inv.SparePartId,
            PartName = inv.SparePart.Name,
            PartNumber = inv.SparePart.PartNumber,
            Category = inv.SparePart.Category,
            ServiceCenterId = inv.ServiceCenterId,
            ServiceCenterName = inv.ServiceCenter.Name,
            Governorate = inv.ServiceCenter.Governorate,
            Quantity = inv.Quantity,
            IsAvailable = inv.IsAvailable,
            Price = inv.Price,
            LowStockThreshold = inv.LowStockThreshold,
            IsFlaggedLowStock = inv.IsFlaggedLowStock,
            UpdatedAt = inv.UpdatedAt
        };
        public static InventoryHistoryDto ToInventoryHistoryDto(InventoryHistory h) => new()
        {
            Id = h.Id,
            ChangedByName = h.ChangedBy.FullName,
            PreviousQuantity = h.PreviousQuantity,
            NewQuantity = h.NewQuantity,
            PreviousPrice = h.PreviousPrice,
            NewPrice = h.NewPrice,
            Reason = h.Reason,
            ChangedAt = h.ChangedAt
        };
    }
}
