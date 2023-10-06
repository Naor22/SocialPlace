import axios from "axios";

const api = axios.create({
  baseURL: "https://api.social-place.com",
});

export default api;
