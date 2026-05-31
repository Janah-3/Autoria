export function mapServiceCenterListItem(item) {
  const tags = item.serviceTypes || item.ServiceTypes || [];

  let gov = item.governorate ?? item.Governorate;
  let dist = item.district ?? item.District;

  if (!gov || !dist) {
    const addr = item.address ?? item.Address;
    if (addr && typeof addr === "string") {
      const parts = addr.split(",").map(s => s.trim());
      const len = parts.length;
      if (len >= 3) {
        if (!gov) gov = parts[len - 2];
        if (!dist) dist = parts[len - 3];
      } else if (len === 2) {
        if (!gov) gov = parts[0];
      }
    }
  }

  gov = gov || "Cairo";
  dist = dist || "Maadi";

  const loc = [dist, gov].filter(Boolean).join(", ");

  return {
    id: item.id ?? item.Id,
    name: item.name ?? item.Name,
    loc: loc,
    city: gov,
    address: item.address ?? item.Address ?? loc,
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
    governorate: gov,
    district: dist,
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
