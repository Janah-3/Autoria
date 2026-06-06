"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sparePartsService } from "../../../../lib/sparePartsService";
import { reservationsService } from "../../../../lib/api/reservationsService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";
import { useTranslations } from "next-intl";

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  white: "#FFFFFF",
  border: "#E9ECEF",
  text: "#111111",
  textLight: "#6C757D",
  success: "#28A745",
};

export default function SparePartDetailsPage() {
  const { authorized, checking } = useRoleGuard();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("sparePartDetails");

  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  useEffect(() => {
    if (!params?.id) return;
    const fetchPartDetails = async () => {
      try {
        setLoading(true);
        const data = await sparePartsService.getSparePartById(params.id);
        setPart(data);
        const imgs = data?.images ?? data?.Images;
        if (imgs?.length > 0) setActiveImage(imgs[0]);
        const availability = data?.availability ?? data?.Availability ?? [];
        if (availability.length > 0) setSelectedCenter(availability[0]);
      } catch (err) {
        console.error("Error loading spare part details:", err);
        setError(t("notFound"));
      } finally {
        setLoading(false);
      }
    };
    fetchPartDetails();
  }, [params?.id]);

  if (checking) return null;
  if (!authorized) return null;

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
        <Navbar />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", fontSize: "16px", color: COLORS.textLight }}>
          {t("loading")}
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !part) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <h2 style={{ color: COLORS.primary, marginBottom: "10px" }}>{t("error")}</h2>
          <p style={{ color: COLORS.textLight, marginBottom: "20px" }}>{error || t("notFound")}</p>
          <button
            onClick={() => router.push("/spare-parts-search")}
            style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
          >
            {t("backToSearch")}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const category     = part.category ?? part.Category ?? "";
  const name         = part.name ?? part.Name ?? "";
  const partNumber   = part.partNumber ?? part.PartNumber ?? "";
  const brand        = part.brand ?? part.Brand ?? "";
  const model        = part.model ?? part.Model ?? "";
  const countryOfOrigin = part.countryOfOrigin ?? part.CountryOfOrigin ?? "";
  const manufacturer = part.manufacturer ?? part.Manufacturer ?? "";
  const productionDate = part.productionDate ?? part.ProductionDate ?? "";
  const images       = part.images ?? part.Images ?? [];
  const description  = part.description ?? part.Description ?? "";
  const availability = part.availability ?? part.Availability ?? [];

  const specs = [
    { label: t("specs.category"),       value: category },
    { label: t("specs.brand"),          value: brand },
    { label: t("specs.modelCode"),      value: model },
    { label: t("specs.partNumberSku"),  value: partNumber || "N/A" },
    { label: t("specs.countryOfOrigin"),value: countryOfOrigin || "N/A" },
    { label: t("specs.manufacturer"),   value: manufacturer || "N/A" },
    { label: t("specs.productionDate"), value: productionDate ? new Date(productionDate).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A" },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
      <Navbar />

      {/* ── Breadcrumb + Title ── */}
      <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: "40px 6%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: COLORS.textLight, marginBottom: "15px" }}>
            {t("breadcrumbRoot")} / {category} / {name}
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>{name}</h1>
          <p style={{ color: COLORS.textLight, fontSize: "14px" }}>
            {t("partNumber")}: {partNumber || "N/A"} • {t("brand")}: {brand}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 6%", display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>

        {/* ── Left Column ── */}
        <div>
          {/* Images */}
          <div style={{ background: "#fff", borderRadius: "15px", border: `1px solid ${COLORS.border}`, padding: "20px", marginBottom: "30px" }}>
            <div style={{ height: "400px", background: "#f1f3f5", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {activeImage ? (
                <img src={activeImage} alt={name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: "100px" }}>📦</span>
              )}
            </div>
            {images?.length > 1 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "15px", overflowX: "auto", paddingBottom: "5px" }}>
                {images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveImage(img)}
                    style={{ width: "70px", height: "70px", borderRadius: "8px", border: `2px solid ${activeImage === img ? COLORS.primary : COLORS.border}`, overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
                  >
                    <img src={img} alt={`${name} view ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px" }}>{t("descriptionTitle")}</h3>
            <p style={{ lineHeight: 1.7, color: COLORS.textLight }}>{description || t("noDescription")}</p>
          </div>

          {/* Specs */}
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px" }}>{t("specsTitle")}</h3>
            {specs.map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textLight }}>{s.label}</span>
                <span style={{ fontWeight: "bold" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {/* Price Card */}
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `2px solid ${COLORS.primary}`, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "14px", color: COLORS.textLight, marginBottom: "5px" }}>{t("priceFrom")}</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: COLORS.primary, marginBottom: "15px" }}>
              <span style={{ fontSize: "16px" }}>EGP</span>{" "}
              {availability?.length > 0 ? Math.min(...availability.map(a => a.price || Infinity)) : "N/A"}
            </div>
            <div style={{ fontSize: "13px", color: COLORS.textLight, lineHeight: "1.5", padding: "12px", background: "#F8F9FA", borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
              💡 <strong>{t("howToReserve")}</strong> {t("howToReserveDesc")}
            </div>
          </div>

          {/* Availability */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: "12px", color: COLORS.textLight, marginBottom: "12px", fontWeight: "bold", letterSpacing: "0.5px" }}>
              {t("availableAt")}
            </div>
            {availability?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {availability.map((av, index) => (
                  <div key={index} style={{ borderBottom: index < availability.length - 1 ? `1px solid ${COLORS.border}` : "none", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "14px", color: COLORS.text }}>{av.serviceCenterName || "Verified Service Center"}</div>
                      <div style={{ fontSize: "12px", color: COLORS.textLight, marginTop: "2px" }}>
                        Price: <span style={{ color: COLORS.primary, fontWeight: "bold" }}>EGP {av.price}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: COLORS.success, marginTop: "4px" }}>
                        ✓ {t("inStock")} ({av.quantity || "Available"})
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedCenter(av); setQuantity(1); setReserveModalOpen(true); }}
                      style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      {t("reserve")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: COLORS.textLight, textAlign: "center", padding: "10px 0" }}>
                {t("availableOnRequest")}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Reservation Modal ── */}
      {reserveModalOpen && (
        <div
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(5px)", fontFamily: "sans-serif" }}
          onClick={() => !reserving && setReserveModalOpen(false)}
        >
          <div
            style={{ background: "#FFF", borderRadius: "20px", padding: "30px", width: "90%", maxWidth: "500px", boxShadow: "0 15px 40px rgba(0,0,0,0.2)", position: "relative" }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px", color: COLORS.text }}>
              {reserveSuccess ? t("modal.titleSuccess") : t("modal.titleReserve")}
            </h2>
            <p style={{ fontSize: "14px", color: COLORS.textLight, marginBottom: "24px" }}>
              {reserveSuccess ? t("modal.subtitleSuccess") : `${t("modal.subtitleReserve")} "${name}"`}
            </p>

            {reserveError && (
              <div style={{ background: "#FEEBEB", border: `1px solid ${COLORS.primary}`, color: COLORS.primary, padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, marginBottom: "20px" }}>
                ⚠️ {reserveError}
              </div>
            )}

            {!reserveSuccess ? (
              <>
                {/* Center Selection */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: COLORS.textLight, marginBottom: "8px", letterSpacing: "0.5px" }}>
                    {t("modal.selectCenter")}
                  </label>
                  {availability.length > 0 ? (
                    <select
                      value={selectedCenter?.serviceCenterId ?? selectedCenter?.ServiceCenterId ?? ""}
                      onChange={e => {
                        const sel = availability.find(a => (a.serviceCenterId ?? a.ServiceCenterId) === e.target.value);
                        setSelectedCenter(sel);
                        setQuantity(1);
                      }}
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1.5px solid ${COLORS.border}`, fontSize: "14px", fontWeight: 600, outline: "none", background: "#F8F9FA" }}
                    >
                      {availability.map((av, index) => (
                        <option key={index} value={av.serviceCenterId ?? av.ServiceCenterId}>
                          {av.serviceCenterName ?? "Service Center"} - EGP {av.price} ({av.quantity} in stock)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ color: COLORS.primary, fontWeight: "600", fontSize: "14px" }}>
                      {t("modal.outOfStock")}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                {selectedCenter && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: COLORS.textLight, letterSpacing: "0.5px" }}>
                        {t("modal.quantity")}
                      </label>
                      <span style={{ fontSize: "12px", color: COLORS.success, fontWeight: "700" }}>
                        {t("modal.inStock")}: {selectedCenter.quantity}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                        style={{ width: "40px", height: "40px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, background: "#FFF", fontSize: "18px", fontWeight: "bold", cursor: quantity <= 1 ? "not-allowed" : "pointer", opacity: quantity <= 1 ? 0.5 : 1 }}>-</button>
                      <span style={{ fontSize: "16px", fontWeight: "800", width: "30px", textAlign: "center" }}>{quantity}</span>
                      <button onClick={() => setQuantity(q => Math.min(selectedCenter.quantity, q + 1))} disabled={quantity >= selectedCenter.quantity}
                        style={{ width: "40px", height: "40px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, background: "#FFF", fontSize: "18px", fontWeight: "bold", cursor: quantity >= selectedCenter.quantity ? "not-allowed" : "pointer", opacity: quantity >= selectedCenter.quantity ? 0.5 : 1 }}>+</button>
                    </div>
                  </div>
                )}

                {/* Total */}
                {selectedCenter && (
                  <div style={{ background: "#F8F9FA", borderRadius: "12px", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${COLORS.border}`, marginBottom: "30px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: COLORS.textLight, fontWeight: "700" }}>{t("modal.totalPrice")}</div>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: COLORS.primary, marginTop: "2px" }}>
                        EGP {selectedCenter.price * quantity}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: COLORS.textLight, textAlign: "right" }}>
                      EGP {selectedCenter.price} × {quantity}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button disabled={reserving} onClick={() => setReserveModalOpen(false)}
                    style={{ flex: 1, padding: "12px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, background: "transparent", fontWeight: "600", cursor: "pointer", fontSize: "14px", color: COLORS.text }}>
                    {t("modal.cancel")}
                  </button>
                  <button
                    disabled={reserving || !selectedCenter}
                    onClick={async () => {
                      setReserving(true);
                      setReserveError(null);
                      try {
                        const payload = {
                          serviceCenterId: selectedCenter.serviceCenterId ?? selectedCenter.ServiceCenterId,
                          sparePartId: part.id ?? part.Id ?? params.id,
                          quantity: Number(quantity),
                          bookingId: null,
                        };
                        const res = await reservationsService.reservePart(payload);
                        if (res?.success || res?.success === undefined) {
                          setReserveSuccess(true);
                        } else {
                          throw new Error(res?.message || "Failed to complete reservation.");
                        }
                      } catch (err) {
                        setReserveError(err.message || "An unexpected error occurred during reservation.");
                      } finally {
                        setReserving(false);
                      }
                    }}
                    style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: COLORS.primary, color: "#FFF", fontWeight: "700", cursor: reserving || !selectedCenter ? "not-allowed" : "pointer", fontSize: "14px", opacity: reserving || !selectedCenter ? 0.7 : 1 }}
                  >
                    {reserving ? t("modal.reserving") : t("modal.confirmReservation")}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 0 0 0" }}>
                <div style={{ width: "80px", height: "80px", background: "#E7F5EA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", fontSize: "40px" }}>
                  ✅
                </div>
                <div style={{ background: "#F8F9FA", padding: "15px", borderRadius: "10px", fontSize: "13px", color: COLORS.text, border: `1px solid ${COLORS.border}`, lineHeight: "1.6", marginBottom: "25px", textAlign: "left" }}>
                  📍 <strong>{t("modal.successCenter")}:</strong> {selectedCenter?.serviceCenterName}<br />
                  📦 <strong>{t("modal.successPart")}:</strong> {name}<br />
                  🔢 <strong>{t("modal.successQuantity")}:</strong> {quantity} {t("modal.pcs")}<br />
                  💰 <strong>{t("modal.successTotal")}:</strong> EGP {selectedCenter?.price * quantity}<br />
                  ⏳ <strong>{t("modal.expiration")}:</strong> {t("modal.successExpiry")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={() => { setReserveModalOpen(false); setReserveSuccess(false); router.push("/reservations"); }}
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: COLORS.primary, color: "#FFF", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                  >
                    {t("modal.viewReservations")}
                  </button>
                  <button
                    onClick={() => { setReserveModalOpen(false); setReserveSuccess(false); }}
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textLight, fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
                  >
                    {t("modal.close")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}