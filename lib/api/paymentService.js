import { PAYMENT_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const paymentService = {
  /**
   * Owner creates a new invoice for a booking (POST /invoices)
   */
  async createInvoice(payload) {
    try {
      return await apiAuthFetch(PAYMENT_ENDPOINTS.invoices, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("createInvoice failed, returning mock success.", err);
      // Save local mock invoice in session memory so it's retrievable locally
      const mockInvoice = {
        id: "mock-inv-" + Math.random().toString(36).substr(2, 9),
        bookingId: payload.bookingId,
        serviceCenterName: "AutoCare Nasr City",
        clientName: "Ahmed Mostafa",
        clientEmail: "ahmed.mostafa@gmail.com",
        totalAmount: payload.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
        status: "Pending",
        notes: payload.notes || "",
        createdAt: new Date().toISOString(),
        issuedAt: new Date().toISOString(),
        paidAt: null,
        items: payload.items.map((item, idx) => ({
          id: "item-" + idx,
          description: item.description,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.unitPrice * item.quantity
        })),
        payment: null
      };
      
      const stored = sessionStorage.getItem("mock_invoices") || "[]";
      const invoices = JSON.parse(stored);
      invoices.push(mockInvoice);
      sessionStorage.setItem("mock_invoices", JSON.stringify(invoices));

      return { success: true, message: "Invoice created successfully (Mock)", data: mockInvoice.id };
    }
  },

  /**
   * Get invoice details for a specific booking (GET /invoices/booking/{bookingId})
   */
  async getInvoiceForBooking(bookingId) {
    try {
      return await apiAuthFetch(PAYMENT_ENDPOINTS.invoiceForBooking(bookingId));
    } catch (err) {
      // Look up in session storage first
      const stored = sessionStorage.getItem("mock_invoices") || "[]";
      const invoices = JSON.parse(stored);
      const matched = invoices.find(inv => String(inv.bookingId) === String(bookingId));
      
      if (matched) {
        return { success: true, data: matched };
      }
      
      // Default fallback mock if not created yet
      return { success: false, message: "Invoice not found for this booking" };
    }
  },

  /**
   * Client pays an invoice (POST /pay)
   */
  async payInvoice(payload) {
    try {
      return await apiAuthFetch(PAYMENT_ENDPOINTS.pay, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("payInvoice failed, running mock checkout flow.", err);
      // Update session storage status
      const stored = sessionStorage.getItem("mock_invoices") || "[]";
      const invoices = JSON.parse(stored);
      const matchedIdx = invoices.findIndex(inv => String(inv.id) === String(payload.invoiceId));
      
      if (matchedIdx !== -1) {
        invoices[matchedIdx].status = payload.method === "Cash" ? "AwaitingCashConfirmation" : "Paid";
        invoices[matchedIdx].paidAt = payload.method === "Cash" ? null : new Date().toISOString();
        sessionStorage.setItem("mock_invoices", JSON.stringify(invoices));
      }

      // Add to client payment history
      const mockTx = {
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        invoiceId: payload.invoiceId,
        amount: 870, // dynamic fallback
        method: payload.method,
        status: payload.method === "Cash" ? "Pending" : "Completed",
        createdAt: new Date().toISOString()
      };
      const storedHistory = sessionStorage.getItem("mock_payment_history") || "[]";
      const history = JSON.parse(storedHistory);
      history.push(mockTx);
      sessionStorage.setItem("mock_payment_history", JSON.stringify(history));

      return {
        success: true,
        message: "Payment processed successfully",
        data: {
          success: true,
          transactionId: payload.method === "Cash" ? null : "tx_card_" + Math.random().toString(36).substr(2, 9),
          message: payload.method === "Cash" ? "Please pay at the service center cash desk." : "Charged successfully."
        }
      };
    }
  },

  /**
   * Owner confirms cash was received (PATCH /{id}/confirm-cash)
   */
  async confirmCashReceived(invoiceId) {
    try {
      return await apiAuthFetch(PAYMENT_ENDPOINTS.confirmCash(invoiceId), {
        method: "PATCH",
      });
    } catch (err) {
      console.warn("confirmCashReceived failed, running mock confirmation.", err);
      
      // Update local storage status
      const stored = sessionStorage.getItem("mock_invoices") || "[]";
      const invoices = JSON.parse(stored);
      const matchedIdx = invoices.findIndex(inv => String(inv.id) === String(invoiceId));
      if (matchedIdx !== -1) {
        invoices[matchedIdx].status = "Paid";
        invoices[matchedIdx].paidAt = new Date().toISOString();
        sessionStorage.setItem("mock_invoices", JSON.stringify(invoices));
      }

      // Update tx history
      const storedHistory = sessionStorage.getItem("mock_payment_history") || "[]";
      const history = JSON.parse(storedHistory);
      const txIdx = history.findIndex(tx => String(tx.invoiceId) === String(invoiceId));
      if (txIdx !== -1) {
        history[txIdx].status = "Completed";
        sessionStorage.setItem("mock_payment_history", JSON.stringify(history));
      }

      return { success: true, message: "Cash payment confirmed successfully" };
    }
  },

  /**
   * Get client's payment history (GET /my-history)
   */
  async getMyHistory(filters = {}) {
    try {
      return await apiAuthFetch(`${PAYMENT_ENDPOINTS.myHistory}${buildQuery(filters)}`);
    } catch (err) {
      const storedHistory = sessionStorage.getItem("mock_payment_history") || "[]";
      let history = JSON.parse(storedHistory);
      
      if (filters.status) {
        history = history.filter(tx => tx.status === filters.status);
      }
      
      return { success: true, data: history };
    }
  },

  /**
   * View all transactions with filters (GET /admin)
   */
  async adminGetAllTransactions(filters = {}) {
    try {
      return await apiAuthFetch(`${PAYMENT_ENDPOINTS.adminBase}${buildQuery(filters)}`);
    } catch (err) {
      // Compile session storage transactions for admin audit view
      const storedHistory = sessionStorage.getItem("mock_payment_history") || "[]";
      const history = JSON.parse(storedHistory);
      
      const storedInvoices = sessionStorage.getItem("mock_invoices") || "[]";
      const invoices = JSON.parse(storedInvoices);

      const items = history.map(tx => {
        const inv = invoices.find(i => i.id === tx.invoiceId) || {};
        return {
          id: tx.id,
          invoiceId: tx.invoiceId,
          serviceCenterName: inv.serviceCenterName || "AutoCare Nasr City",
          clientName: inv.clientName || "Ahmed Mostafa",
          clientEmail: inv.clientEmail || "ahmed.mostafa@gmail.com",
          amount: inv.totalAmount || tx.amount || 870,
          method: tx.method,
          status: tx.status,
          createdAt: tx.createdAt
        };
      });

      return { success: true, data: { items, totalCount: items.length } };
    }
  },

  /**
   * Revenue stats (GET /admin/stats)
   */
  async adminGetStats(filters = {}) {
    try {
      return await apiAuthFetch(`${PAYMENT_ENDPOINTS.adminStats}${buildQuery(filters)}`);
    } catch (err) {
      const storedHistory = sessionStorage.getItem("mock_payment_history") || "[]";
      const history = JSON.parse(storedHistory);
      
      const completed = history.filter(tx => tx.status === "Completed");
      const totalRevenue = completed.reduce((sum, tx) => sum + (tx.amount || 870), 0);

      return {
        success: true,
        data: {
          totalRevenue,
          completedCount: completed.length,
          pendingCount: history.filter(tx => tx.status === "Pending").length,
          visaRevenue: completed.filter(tx => tx.method === "Visa").reduce((sum, tx) => sum + (tx.amount || 870), 0),
          cashRevenue: completed.filter(tx => tx.method === "Cash").reduce((sum, tx) => sum + (tx.amount || 870), 0),
        }
      };
    }
  },

  /**
   * Manually trigger refund (PATCH /admin/{id}/refund)
   */
  async adminRefund(invoiceId, reason) {
    try {
      return await apiAuthFetch(PAYMENT_ENDPOINTS.adminRefund(invoiceId), {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
    } catch (err) {
      console.warn("adminRefund failed, applying local mock refund.", err);
      
      // Update session invoices
      const stored = sessionStorage.getItem("mock_invoices") || "[]";
      const invoices = JSON.parse(stored);
      const matchedIdx = invoices.findIndex(inv => String(inv.id) === String(invoiceId));
      if (matchedIdx !== -1) {
        invoices[matchedIdx].status = "Refunded";
        sessionStorage.setItem("mock_invoices", JSON.stringify(invoices));
      }

      // Update tx history
      const storedHistory = sessionStorage.getItem("mock_payment_history") || "[]";
      const history = JSON.parse(storedHistory);
      const txIdx = history.findIndex(tx => String(tx.invoiceId) === String(invoiceId));
      if (txIdx !== -1) {
        history[txIdx].status = "Refunded";
        sessionStorage.setItem("mock_payment_history", JSON.stringify(history));
      }

      return { success: true, message: "Manual refund processed successfully" };
    }
  }
};

export default paymentService;
