/**
 * Shared utilities: toast trigger factory and JWT role decoder.
 * Use createToastTrigger() in each page to get a triggerToast function
 * that works with useState-based toast state.
 *
 * Usage:
 *   const [showToast, setShowToast] = useState(false);
 *   const [toastMsg, setToastMsg]   = useState('');
 *   const [toastType, setToastType] = useState('success');
 *   const triggerToast = createToastTrigger(setShowToast, setToastMsg, setToastType);
 */

/**
 * Returns a triggerToast(message, type) function bound to the given state setters.
 * @param {Function} setShow
 * @param {Function} setMsg
 * @param {Function} setType
 * @param {number} duration  ms before toast hides (default 4000)
 */
export function createToastTrigger(setShow, setMsg, setType, duration = 4000) {
  let timer = null;
  return (message, type = "success") => {
    setMsg(message);
    setType(type);
    setShow(true);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => setShow(false), duration);
  };
}

/**
 * Decode the JWT stored in localStorage and return the role claim.
 * Returns null if no token found or decoding fails.
 */
export function getTokenRole() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // ASP.NET Core uses the long ClaimTypes URI or the short "role" key
    return (
      payload["role"] ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["Role"] ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Returns true if the current user's role matches one of allowedRoles.
 * @param {string[]} allowedRoles
 */
export function hasRole(allowedRoles) {
  const role = getTokenRole();
  if (!role) return false;
  return allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase());
}
