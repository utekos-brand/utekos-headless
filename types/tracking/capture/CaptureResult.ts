// Path: types/tracking/capture/CaptureResult.ts

export type CaptureResult =
  | { success: true }
  | { success: false; error: string }
