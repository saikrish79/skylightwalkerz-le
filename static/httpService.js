export const http = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  api: window.location.origin + "/api",
  socketApi: "http://127.0.0.1:5000",
  //api: "http://localhost:8080/api",
  //websocketApi: "http://localhost:8080/socket",
  //api: "/api",
  //websocketApi: "/socket",
};
