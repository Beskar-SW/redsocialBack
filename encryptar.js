import CryptoJS from "crypto-js";

export function encrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.Encrypt_key).toString();
}

export function decrypt(data) {
  return CryptoJS.AES.decrypt(data, process.env.Encrypt_key).toString(CryptoJS.enc.Utf8);
}