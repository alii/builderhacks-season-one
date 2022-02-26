export const AWS_REGION = validateEnv("AWS_REGION");
export const AWS_ACCESS_KEY_ID = validateEnv("AWS_ACCESS_KEY_ID");
export const AWS_SECRET_ACCESS_KEY = validateEnv("AWS_SECRET_ACCESS_KEY");

export const SQS_URL = validateEnv("SQS_URL");

export function validateEnv<T extends string = string>(
  key: keyof NodeJS.ProcessEnv,
  defaultValue?: T
): T {
  const value = process.env[key] as T | undefined;

  if (!value) {
    if (typeof defaultValue !== "undefined") {
      return defaultValue;
    } else {
      throw new Error(`Environment variable: ${key} must be defined`);
    }
  }

  return value;
}
