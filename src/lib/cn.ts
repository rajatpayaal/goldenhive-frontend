export type ClassValue = string | null | undefined | false;

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

