import { api } from "../api";

export async function login(email, password) {
  return api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
