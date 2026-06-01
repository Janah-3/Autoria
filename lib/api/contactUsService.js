import { CONTACT_US_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const contactUsService = {
  async submitMessage(payload) {
    // payload: { fullName, email, subject, message }
    return apiAuthFetch(CONTACT_US_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getAdminMessages(params = {}) {
    // params can contain isResolved (true/false), page, pageSize, etc.
    const query = buildQuery(params);
    return apiAuthFetch(`${CONTACT_US_ENDPOINTS.adminMessages}${query}`);
  },

  async resolveMessage(id, adminNotes) {
    // payload: { adminNotes }
    return apiAuthFetch(CONTACT_US_ENDPOINTS.resolve(id), {
      method: "PATCH",
      body: JSON.stringify({ adminNotes }),
    });
  },
};

export default contactUsService;
