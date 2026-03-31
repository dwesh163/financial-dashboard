import { google } from "googleapis";

export function createGoogleAuth(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export function sheetsClient(accessToken: string) {
  return google.sheets({ version: "v4", auth: createGoogleAuth(accessToken) });
}

export function driveClient(accessToken: string) {
  return google.drive({ version: "v3", auth: createGoogleAuth(accessToken) });
}
