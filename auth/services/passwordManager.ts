import {scrypt, randomBytes} from "crypto";
import {promisify} from "util";

const scryptAsync = promisify(scrypt);

const getPasswordBuffer = async (password: string, salt: string) => {
    return (await scryptAsync(password, salt, 64)) as Buffer;
};

export class PasswordManager {
    static toHash = async (password: string) => {
        const salt = randomBytes(8).toString('hex');
        const buf = await getPasswordBuffer(password, salt);

        return `${buf.toString('hex')}.${salt}`;
    };

    static compare = async (storedPassword: string, suppliedPassword: string) => {
        const [hashedPassword, salt] = storedPassword.split('.');
        const buf = await getPasswordBuffer(suppliedPassword, salt);

        return buf.toString('hex') === hashedPassword;
    };
}
