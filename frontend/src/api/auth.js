import axiosInstance from "./axiosInstance";

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("api/auth/login/", credentials);
  if (response.data.refresh) {
    localStorage.setItem("refresh_token", response.data.refresh);
  }
  return response.data;
};

export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  const response = await axiosInstance.post("api/auth/logout/", {
    refresh_token: refreshToken,
  });
  localStorage.removeItem("refresh_token");
  return response.data;
};