// const BASE_URL = "https://your-api.com/api/cars"; // 👈 غيري ده

// export async function getCars() {
//   const res = await fetch(BASE_URL);
//   return res.json();
// }

// export async function addCar(data) {
//   const res = await fetch(BASE_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       // Authorization: `Bearer ${localStorage.getItem("token")}` 👈 لو في توكن
//     },
//     body: JSON.stringify(data),
//   });

//   return res.json();
// }

// export async function deleteCar(id) {
//   await fetch(`${BASE_URL}/${id}`, {
//     method: "DELETE",
//   });
// }
// FAKE DATA بدل API مؤقتًا

let cars = [
  {
    id: 1,
    brand: "BMW",
    model: "X5",
    year: 2020,
    plate: "ABC 123",
  },
  {
    id: 2,
    brand: "Toyota",
    model: "Corolla",
    year: 2022,
    plate: "XYZ 789",
  },
];

// GET
export async function getCars() {
  return cars;
}

// ADD
export async function addCar(newCar) {
  const car = {
    ...newCar,
    id: Date.now(),
  };

  cars.push(car);
  return car;
}

// DELETE
export async function deleteCar(id) {
  cars = cars.filter((car) => car.id !== id);
}