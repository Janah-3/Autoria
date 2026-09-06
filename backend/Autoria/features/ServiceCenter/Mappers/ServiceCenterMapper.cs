using Autoria.features.ServiceCenter.Dtos;

namespace Autoria.features.ServiceCenter.Mappers
{
    public static class ServiceCenterMapper
    {
        public static ServiceCenterDetailDto ToDetailDto(Entities.ServiceCenter sc) => new()
        {
            Id = sc.Id,
            Name = sc.Name,
            Phone = sc.Phone,
            BusinessEmail = sc.BusinessEmail,
            YearEstablished = sc.YearEstablished,
            Description = sc.Description,
            CommercialRegNo = sc.CommercialRegNo,
            TaxCardNo = sc.TaxCardNo,
            OwnerNationalId = sc.OwnerNationalId,
            OwnerFullName = sc.OwnerFullName,
            NumServiceBays = sc.NumServiceBays,
            Type = sc.Type,
            ApprovalStatus = sc.ApprovalStatus,
            RejectionReason = sc.RejectionReason,
            SubmittedAt = sc.SubmittedAt,
            ApprovedAt = sc.ApprovedAt,
            CreatedAt = sc.CreatedAt,
            Photos = sc.Photos.Select(p => p.PhotoUrl).ToList(),
            CoverPhoto = sc.Photos.Select(p => p.PhotoUrl).FirstOrDefault(),
            ServiceTypes = sc.ServiceTypes.Select(st => st.ServiceType.Name).ToList(),
            CarBrands = sc.CarBrands.Select(cb => cb.CarBrand.Name).ToList(),
            OperatingHours = sc.OperatingHours.Select(h => new OperatingHoursDto
            {
                Day = h.Day,
                OpenTime = h.OpenTime,
                CloseTime = h.CloseTime,
                IsClosed = h.IsClosed
            }).ToList(),
            Documents = sc.Documents.Select(d => new DocumentDto
            {
                DocumentType = d.DocumentType,
                FileUrl = d.FileUrl
            }).ToList()
        };
    }
}
