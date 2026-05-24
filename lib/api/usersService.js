import { USERS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const usersService = {
  async getMe() {
    return apiAuthFetch(USERS_ENDPOINTS.me);
  },

  async updateMe(payload) {
    return apiAuthFetch(USERS_ENDPOINTS.me, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getAll(params = {}) {
    return apiAuthFetch(`${USERS_ENDPOINTS.base}${buildQuery(params)}`);
  },

  async getById(id) {
    return apiAuthFetch(USERS_ENDPOINTS.byId(id));
  },

  async update(id, payload) {
    return apiAuthFetch(USERS_ENDPOINTS.byId(id), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id) {
    return apiAuthFetch(USERS_ENDPOINTS.byId(id), { method: "DELETE" });
  },

  async ban(id) {
    return apiAuthFetch(USERS_ENDPOINTS.ban(id), {
      method: "PATCH",
      body: JSON.stringify({}),
    });
  },

  async unban(id) {
    return apiAuthFetch(USERS_ENDPOINTS.unban(id), {
      method: "PATCH",
      body: JSON.stringify({}),
    });
  },

  async setMyLocation(latitude, longitude) {
    return apiAuthFetch(USERS_ENDPOINTS.myLocation, {
      method: "PUT",
      body: JSON.stringify({ latitude, longitude }),
    });
  },
};

export const getMe = () => usersService.getMe();
export default usersService;
