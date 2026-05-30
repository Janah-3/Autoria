import { apiAuthFetch, buildQuery } from "./client";

export const INVENTORY_ENDPOINTS = {
  base: "/Inventory",
  admin: "/Inventory/admin",
  adminById: (id) => `/Inventory/admin/${id}`,
  flagLowStock: (id) => `/Inventory/admin/${id}/flag-low-stock`,
  history: (id) => `/Inventory/admin/${id}/history`,
};

/**
 * Inventory service — matches the inventory OpenAPI spec.
 *
 * Service-center endpoints:
 *   GET  /api/Inventory           → getStock
 *   PUT  /api/Inventory           → addOrUpdateItem
 *
 * Admin endpoints:
 *   GET  /api/Inventory/admin                     → getAdminInventory
 *   PUT  /api/Inventory/admin/:id                 → adminEditStock
 *   PATCH /api/Inventory/admin/:id/flag-low-stock → flagLowStock
 *   GET  /api/Inventory/admin/:id/history         → getHistory
 */
export const inventoryService = {
  /* ─── Service-Center ─────────────────────────────────── */

  /**
   * View stock availability for a service center.
   * Query params: serviceCenterId?, isAvailable?
   */
  async getStock(params = {}) {
    const res = await apiAuthFetch(
      `${INVENTORY_ENDPOINTS.base}${buildQuery(params)}`
    );
    return res; // { success, message, data: { items, totalCount, page, pageSize, totalPages }, errors }
  },

  /**
   * Add or update a spare part in inventory.
   * Body: { serviceCenterId, sparePartId, quantity, price, isAvailable, reason }
   */
  async addOrUpdateItem(body) {
    const res = await apiAuthFetch(INVENTORY_ENDPOINTS.base, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return res;
  },

  /* ─── Admin ──────────────────────────────────────────── */

  /**
   * View all inventory across all centers.
   * Query params: serviceCenterId?, sparePartId?, isFlaggedLowStock?, isAvailable?
   */
  async getAdminInventory(params = {}) {
    const res = await apiAuthFetch(
      `${INVENTORY_ENDPOINTS.admin}${buildQuery(params)}`
    );
    return res;
  },

  /**
   * Edit stock levels (admin).
   * Body: { quantity, price, isAvailable, lowStockThreshold, reason }
   */
  async adminEditStock(inventoryId, body) {
    const res = await apiAuthFetch(INVENTORY_ENDPOINTS.adminById(inventoryId), {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return res;
  },

  /**
   * Manually flag or unflag low stock (admin).
   * Body: { isFlagged }
   */
  async flagLowStock(inventoryId, isFlagged) {
    const res = await apiAuthFetch(
      INVENTORY_ENDPOINTS.flagLowStock(inventoryId),
      {
        method: "PATCH",
        body: JSON.stringify({ isFlagged }),
      }
    );
    return res;
  },

  /**
   * View inventory change history for an item (admin).
   */
  async getHistory(inventoryId) {
    const res = await apiAuthFetch(
      INVENTORY_ENDPOINTS.history(inventoryId)
    );
    return res;
  },
};

export default inventoryService;
