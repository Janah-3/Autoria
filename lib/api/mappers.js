export function mapServiceCenterListItem(item) {
  const tags = item.serviceTypes || item.ServiceTypes || [];
  return {
    id: item.id ?? item.Id,
    name: item.name ?? item.Name,
    loc: [item.district ?? item.District, item.governorate ?? item.Governorate].filter(Boolean).join(", "),
    city: item.governorate ?? item.Governorate,
    desc:
      item.description ?? item.Description ??
      `${item.type ?? item.Type ?? "Service"} center${tags.length ? ` — ${tags.join(", ")}` : ""}.`,
    tags,
    rating: item.rating ?? item.Rating ?? item.avgRating ?? item.AvgRating ?? null,
    reviews: item.reviewCount ?? item.ReviewCount ?? 0,
    price: "Contact for price",
    badge: item.type ?? item.Type ?? "Center",
    bg: "#f3f4f6",
    cover: item.coverPhoto ?? item.CoverPhoto,
    open: true,
    phone: item.phone ?? item.Phone,
    type: item.type ?? item.Type,
    latitude: item.latitude ?? item.Latitude,
    longitude: item.longitude ?? item.Longitude,
    carBrands: item.carBrands ?? item.CarBrands ?? [],
    serviceTypes: tags,
    operatingHours: item.operatingHours ?? item.OperatingHours,
    photos: item.photos ?? item.Photos,
    streetAddress: item.streetAddress ?? item.StreetAddress,
    businessEmail: item.businessEmail ?? item.BusinessEmail,
    ownerFullName: item.ownerFullName ?? item.OwnerFullName,
    approvalStatus: item.approvalStatus ?? item.ApprovalStatus,
    governorate: item.governorate ?? item.Governorate,
    district: item.district ?? item.District,
    coverPhoto: item.coverPhoto ?? item.CoverPhoto,
  };
}

/** Map API spare part → UI card */
export function mapSparePartItem(item) {
  const car = [item.brand ?? item.Brand, item.model ?? item.Model, item.year ?? item.Year].filter(Boolean).join(" ");
  return {
    ...item,
    id: item.id ?? item.Id,
    name: item.name ?? item.Name ?? item.partName ?? item.PartName ?? "Part",
    car: car || (item.vehicle ?? item.Vehicle ?? ""),
    price: item.price ?? item.Price ?? item.unitPrice ?? item.UnitPrice,
    availability:
      item.availability ?? item.Availability ??
      ((item.stock ?? item.Stock) > 0 ? `${item.stock ?? item.Stock} in stock` : "Out of stock"),
    type: item.condition ?? item.Condition ?? item.type ?? item.Type ?? "New",
  };
}

export function getSparePartItems(response) {
  if (Array.isArray(response)) return response.map(mapSparePartItem);
  const raw = response?.data?.items ?? response?.data ?? response?.items ?? [];
  return Array.isArray(raw) ? raw.map(mapSparePartItem) : [];
}

export function getServiceCenterItems(response) {
  const raw = response?.data?.items ?? response?.data ?? (Array.isArray(response) ? response : []);
  return Array.isArray(raw) ? raw.map(mapServiceCenterListItem) : [];
}
