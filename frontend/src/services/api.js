const BASE_URL = "http://127.0.0.1:8000/api";

export const api = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("access");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
};