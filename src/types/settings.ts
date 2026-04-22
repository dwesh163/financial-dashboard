export type SettingsData = {
  userName: string;
  userImage?: string;
  years: number[];
  selectedYear: number;
  version: string;
  isPinSet: boolean;
  inactivityThresholdMs: number;
};
