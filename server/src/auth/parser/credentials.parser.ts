import type { CredentialsDto } from '../dto/credentials.dto.js';

export interface Credentials {
  email: string;
  password: string;
}

// Runs after validation: emails are stored lowercase so sign-in is case-insensitive.
export function parseCredentials(body: CredentialsDto): Credentials {
  return { email: body.email.trim().toLowerCase(), password: body.password };
}
