import dotenv from 'dotenv';

dotenv.config();

export function getEnvVariable<T extends string>(variableName: string): T {
  const value = process.env[variableName];
  if (value === undefined) {
    throw new Error(`${variableName} is not defined`);
  }
  return value as T;
}
