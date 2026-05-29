"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SkeletonCard } from "@/components/Skeleton";
import mechanicsService from "@/lib/api/mechanicsService";
import reviewsService from "@/lib/api/reviewsService";

const R = "#E8272A";
const COLORS = { border: "#E9ECEF", text: "#1A1A1A", muted: "#6C757D", bg: "#F8F9FA", white: "#fff" };

const s = {
  input: { width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.text, background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  label: { fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4, display: "block" },
  group: { marginBottom: 14 },
  row: { display: "flex", gap: 12 },
  card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 16 },
  btn: (v = "primary") => ({ padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: v === "outline" ? `1px solid ${COLORS.border}` : "none", background: v === "primary" ? R : "#fff", color: v === "primary" ? "#fff" : COLORS.text, display: "inline-flex", alignItems: "center", gap: 6 }),
};

const SPECS = ["Engine Repair", "Electrical", "Transmission", "Brakes", "AC System", "Tires"];
const EARNING_TABS = ["All Time", "Custom"];

export default function MechanicProfilePage() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [earningsTab, setEarningsTab] = useState("All Time");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);

  const [editForm, setEditForm] = useState({ city: "", latitude: "", longitude: "", yearsOfExperience: "", specializationIds: [] });

  // 1. Fetch the logged-in user profile on component mount
  useEffect(() => {
    mechanicsService.getMyProfile()
      .then(res => {
        setProfile(res?.data);
        setEditForm({
          city: res?.data?.city || "",
          latitude: res?.data?.latitude || "",
          longitude: res?.data?.longitude || "",
          yearsOfExperience: res?.data?.yearsOfExperience || "",
          specializationIds: res?.data?.specializationIds || [],
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []); // Cleaned: Removed 'id' reference here since it's session-bound

  // 2. Fetch reviews once profile data has loaded successfully
  useEffect(() => {
    if (!profile?.id) return;
    reviewsService.getReviews({ targetType: "Mechanic", targetId: profile.id, page: 1, pageSize: 5 })
      .then(res => setReviews(res?.data?.items || []))
      .catch(() => {});
  }, [profile?.id]);

  // 3. Handle dashboard earnings retrieval
  const fetchEarnings = useCallback(async () => {
    setEarningsLoading(true);
    try {
      const params = {};
      if (earningsTab === "This Month") {
        const now = new Date();
        params.from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        params.to = now.toISOString().split("T")[0];
      } else if (earningsTab === "Custom" && fromDate && toDate) {
        params.from = fromDate;
        params.to = toDate;
      }
      const res = await mechanicsService.getMyEarnings(params);
      setEarnings(res?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setEarningsLoading(false);
    }
  }, [earningsTab, fromDate, toDate]);

  useEffect(() => { 
    if (profile) fetchEarnings(); 
  }, [profile, fetchEarnings]);

  function toggleSpec(sp) {
    setEditForm(p => ({
      ...p,
      specializationIds: p.specializationIds.includes(sp)
        ? p.specializationIds.filter(x => x !== sp)
        : [...p.specializationIds, sp],
    }));
  }

  async function saveProfile() {
    setSaving(true); setSaveError("");
    try {
      const formData = new FormData();
      if (editForm.city) formData.append("city", editForm.city);
      if (editForm.latitude) formData.append("latitude", editForm.latitude);
      if (editForm.longitude) formData.append("longitude", editForm.longitude);
      if (editForm.yearsOfExperience) formData.append("yearsOfExperience", editForm.yearsOfExperience);
      editForm.specializationIds.forEach(id => formData.append("specializationIds", id));
      if (newPhoto) formData.append("profilePhoto", newPhoto);
      
      await mechanicsService.updateMyProfile(formData);
      setEditMode(false);
      const res = await mechanicsService.getMyProfile();
      setProfile(res?.data);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <><Navbar /><div style={{ padding: "40px 5%" }}><SkeletonCard /><SkeletonCard /></div></>;
  if (error) return <><Navbar /><div style={{ padding: 40, color: R, textAlign: "center" }}>{error}</div></>;

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "32px 5%" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>My Profile</h1>
              <p style={{ fontSize: 13, color: COLORS.muted }}>Manage your profile and track earnings</p>
            </div>
            <button style={s.btn(editMode ? "primary" : "outline")} onClick={() => editMode ? saveProfile() : setEditMode(true)} disabled={saving}>
              {saving ? "Saving..." : editMode ? "✓ Save Changes" : "✎ Edit Profile"}
            </button>
          </div>

          <div style={{ ...s.card, background: "linear-gradient(135deg,#FEF2F2,#fff)", display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: R, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24, color: "#fff" }}>
                {profile?.name?.slice(0, 2).toUpperCase()}
              </div>
              {editMode && (
                <label style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, background: R, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setNewPhoto(e.target.files[0])} />
                  <span style={{ color: "#fff", fontSize: 11 }}>📷</span>
                </label>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{profile?.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#FFB800", fontSize: 14 }}>{"★".repeat(Math.round(profile?.rating || 0))}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{profile?.rating?.toFixed(1)}</span>
                <span style={{ fontSize: 13, color: COLORS.muted }}>• {profile?.city}</span>
                <span style={{ fontSize: 13, color: COLORS.muted }}>• {profile?.yearsOfExperience} yrs exp</span>
              </div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>📞 {profile?.phoneNumber}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {profile?.specializations?.map(sp => (
                  <span key={sp} style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 4, fontSize: 11, color: COLORS.muted }}>{sp}</span>
                ))}
              </div>
              <span style={{ marginTop: 8, display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: profile?.approvalStatus === "Approved" ? "#E8F5E9" : "#FFF8E1", color: profile?.approvalStatus === "Approved" ? "#1B5E20" : "#F57F17" }}>
                {profile?.approvalStatus}
              </span>
            </div>
          </div>

          {editMode && (
            <div style={s.card}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>EDIT DETAILS</div>
              <div style={s.row}>
                <div style={{ ...s.group, flex: 1 }}><label style={s.label}>City</label><input style={s.input} value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} /></div>
                <div style={{ ...s.group, flex: 1 }}><label style={s.label}>Years of Experience</label><input style={s.input} type="number" value={editForm.yearsOfExperience} onChange={e => setEditForm(p => ({ ...p, yearsOfExperience: e.target.value }))} /></div>
              </div>
              <div style={s.row}>
                <div style={{ ...s.group, flex: 1 }}><label style={s.label}>Latitude</label><input style={s.input} value={editForm.latitude} onChange={e => setEditForm(p => ({ ...p, latitude: e.target.value }))} /></div>
                <div style={{ ...s.group, flex: 1 }}><label style={s.label}>Longitude</label><input style={s.input} value={editForm.longitude} onChange={e => setEditForm(p => ({ ...p, longitude: e.target.value }))} /></div>
              </div>
              <div style={s.group}>
                <label style={s.label}>Specializations</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {SPECS.map(sp => (
                    <label key={sp} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer", padding: "5px 10px", borderRadius: 6, background: editForm.specializationIds.includes(sp) ? "#FEF2F2" : "#f3f4f6", border: `1px solid ${editForm.specializationIds.includes(sp) ? R : "transparent"}`, color: editForm.specializationIds.includes(sp) ? R : COLORS.muted, fontWeight: editForm.specializationIds.includes(sp) ? 600 : 400 }}>
                      <input type="checkbox" checked={editForm.specializationIds.includes(sp)} onChange={() => toggleSpec(sp)} style={{ display: "none" }} />{sp}
                    </label>
                  ))}
                </div>
              </div>
              {saveError && <p style={{ color: R, fontSize: 12 }}>{saveError}</p>}
            </div>
          )}

          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>EARNINGS</div>
            <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: 16 }}>
              {EARNING_TABS.map(t => (
                <button key={t} onClick={() => setEarningsTab(t)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: earningsTab === t ? "#fff" : "transparent", color: earningsTab === t ? COLORS.text : COLORS.muted }}>
                  {t}
                </button>
              ))}
            </div>
            {earningsTab === "Custom" && (
              <div style={{ ...s.row, marginBottom: 16 }}>
                <div style={{ ...s.group, flex: 1 }}><label style={s.label}>From</label><input style={s.input} type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
                <div style={{ ...s.group, flex: 1 }}><label style={s.label}>To</label><input style={s.input} type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
              </div>
            )}
            {earningsLoading ? <SkeletonCard /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { label: "Total Earnings", value: `${(earnings?.totalEarnings || 0).toLocaleString()} EGP`, color: R },
                  { label: "Completed Jobs", value: earnings?.completedJobsCount || 0 },
                  { label: "Avg per Job", value: earnings?.completedJobsCount ? `${Math.round((earnings.totalEarnings || 0) / earnings.completedJobsCount)} EGP` : "—" },
                ].map(stat => (
                  <div key={stat.label} style={{ background: "#f8f9fa", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>{stat.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: stat.color || COLORS.text }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>RECENT REVIEWS</div>
            {reviews.length === 0 ? (
              <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: 20 }}>No reviews yet</p>
            ) : reviews.map(r => (
              <div key={r.id} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.reviewerName}</span>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ color: "#FFB800", fontSize: 13, marginBottom: 4 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <p style={{ fontSize: 13, color: COLORS.muted }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}