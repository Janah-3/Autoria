/** Map API service center → UI card / list item */
export function mapServiceCenterListItem(item) {
  const tags = item.serviceTypes || [];
  return {
    id: item.id,
    name: item.name,
    loc: [item.district, item.governorate].filter(Boolean).join(", "),
    city: item.governorate,
    desc:
      item.description ||
      `${item.type || "Service"} center${tags.length ? ` — ${tags.join(", ")}` : ""}.`,
    tags,
    rating: item.rating ?? item.avgRating ?? null,
    reviews: item.reviewCount ?? 0,
    price: "Contact for price",
    badge: item.type || "Center",
    bg: "#f3f4f6",
    cover: item.coverPhoto,
    open: true,
    phone: item.phone,
    type: item.type,
    latitude: item.latitude,
    longitude: item.longitude,
    carBrands: item.carBrands || [],
    serviceTypes: tags,
    operatingHours: item.operatingHours,
    photos: item.photos,
    streetAddress: item.streetAddress,
    businessEmail: item.businessEmail,
    ownerFullName: item.ownerFullName,
    approvalStatus: item.approvalStatus,
    governorate: item.governorate,
    district: item.district,
    coverPhoto: item.coverPhoto,
  };
}

/** Map API spare part → UI card */
export function mapSparePartItem(item) {
  const car = [item.brand, item.model, item.year].filter(Boolean).join(" ");
  return {
    ...item,
    id: item.id,
    name: item.name || item.partName || "Part",
    car: car || item.vehicle || "",
    price: item.price ?? item.unitPrice,
    availability:
      item.availability ??
      (item.stock > 0 ? `${item.stock} in stock` : "Out of stock"),
    type: item.condition || item.type || "New",
  };
}

export function getSparePartItems(response) {
  if (Array.isArray(response)) return response.map(mapSparePartItem);
  const raw = response?.data?.items ?? response?.data ?? response?.items ?? [];
  return Array.isArray(raw) ? raw.map(mapSparePartItem) : [];
}

export function getServiceCenterItems(response) {
  const raw = response?.data?.items ?? [];
  return Array.isArray(raw) ? raw.map(mapServiceCenterListItem) : [];
}
