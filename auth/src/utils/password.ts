import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  private static keyLength: number = 64;

  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(
      password,
      salt,
      Password.keyLength
    )) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  static async comparePassword(
    storedPassword: string,
    providedPassword: string
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(
      providedPassword,
      salt,
      Password.keyLength
    )) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}
