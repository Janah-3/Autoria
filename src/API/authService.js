const BASE_URL = "http://localhost:5236"; 

export const signup = async (userData) => {
  const res = await fetch(`${BASE_URL}/api/Auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({git commit -m "added login and signup pages"
      FullName: userData.name,          
      Email: userData.email,
      Password: userData.password,
      ConfirmPassword: userData.confirmPassword,
      PhoneNumber: userData.phone,      
    }),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

export const login = async (userData) => {
  const res = await fetch(`${BASE_URL}/api/Auth/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password
    }),
  });

  const data = await res.json();


  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Login failed");
  }
  return data; 
};