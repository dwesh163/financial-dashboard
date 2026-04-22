export type PinActionResult = { success: true } | { success: false; error: string };
export type PinStage = "idle" | "entering" | "confirming";
