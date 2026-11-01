/**
 * Mengubah galat dari API menjadi teks yang bisa ditampilkan.
 * Rute kita memakai dua bentuk: string, atau objek { code, message, details }.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}
