import { BASE_URL } from "./allApi";

const MOCK_BOOKINGS = [
  {
    id: "BK-001",
    serviceCenter: {
      id: "SC-01",
      name: "Al Noor Auto Service",
      address: "15 Omar Ibn Al-Khattab St, Cairo",
      phone: "+20 100 123 4567",
      imageUrl: null,
    },
    service: {
      type: "Routine Maintenance",
      description: "Oil change, filter replacement, and full inspection",
    },
    car: {
      make: "Toyota",
      model: "Camry",
      year: 2021,
      licensePlate: "ABC 1234",
      color: "#E8192C",
    },
    date: "2024-06-15",
    timeSlot: "10:00 AM",
    notes: "Please also check the brake pads if possible.",
    status: "Confirmed",
    createdAt: "2024-06-10",
  },
  {
    id: "BK-002",
    serviceCenter: {
      id: "SC-02",
      name: "ProTech Automotive",
      address: "88 Ramsis Street, Giza",
      phone: "+20 111 987 6543",
      imageUrl: null,
    },
    service: {
      type: "Air Conditioning Repair",
      description: "AC gas refill and compressor inspection",
    },
    car: {
      make: "Hyundai",
      model: "Elantra",
      year: 2019,
      licensePlate: "XYZ 5678",
      color: "#1565C0",
    },
    date: "2024-05-20",
    timeSlot: "02:00 PM",
    notes: "",
    status: "Completed",
    createdAt: "2024-05-14",
  },
  {
    id: "BK-003",
    serviceCenter: {
      id: "SC-03",
      name: "Elite Motors Workshop",
      address: "22 Salah Salem, Heliopolis",
      phone: "+20 122 456 7890",
      imageUrl: null,
    },
    service: {
      type: "Body Work",
      description: "Front bumper replacement and paint matching",
    },
    car: {
      make: "BMW",
      model: "320i",
      year: 2022,
      licensePlate: "BMW 9999",
      color: "#212121",
    },
    date: "2024-07-02",
    timeSlot: "09:00 AM",
    notes: "The paint must match exactly — Jet Black.",
    status: "Pending",
    createdAt: "2024-06-28",
  },
  {
    id: "BK-004",
    serviceCenter: {
      id: "SC-01",
      name: "Al Noor Auto Service",
      address: "15 Omar Ibn Al-Khattab St, Cairo",
      phone: "+20 100 123 4567",
      imageUrl: null,
    },
    service: {
      type: "Electrical Diagnosis",
      description: "Check engine light diagnostic scan",
    },
    car: {
      make: "Toyota",
      model: "Camry",
      year: 2021,
      licensePlate: "ABC 1234",
      color: "#E8192C",
    },
    date: "2024-04-10",
    timeSlot: "11:00 AM",
    notes: "",
    status: "Cancelled",
    createdAt: "2024-04-05",
    cancellationReason: "Found another service center",
  },
];


const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};


export const getAllBookings = async () => {

  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: MOCK_BOOKINGS }), 600);
  });
};


export const getBookingById = async (id) => {


  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booking = MOCK_BOOKINGS.find((b) => b.id === id);
      if (booking) {
        resolve({ data: booking });
      } else {
        reject(new Error("Booking not found"));
      }
    }, 400);
  });
};


export const cancelBooking = async (id, reason) => {



  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: "Booking cancelled successfully" });
    }, 800);
  });
};
