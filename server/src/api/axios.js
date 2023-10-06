import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    Headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });

  export default api;