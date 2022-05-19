import jsCookie from "js-cookie";

const USER_COOKIE = "mediasoup-demo.user";
const DEVICES_COOKIE = "mediasoup-demo.devices";

export function getUser() {
  return JSON.parse(jsCookie.get(USER_COOKIE) || "null");
}

export function setUser({ displayName }) {
  jsCookie.set(USER_COOKIE, JSON.stringify({ displayName }));
}

export function getDevices() {
  return JSON.parse(jsCookie.get(DEVICES_COOKIE) || "null");
}

export function setDevices({ webcamEnabled }) {
  jsCookie.set(DEVICES_COOKIE, JSON.stringify({ webcamEnabled }));
}
