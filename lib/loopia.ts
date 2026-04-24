import xmlrpc from 'xmlrpc';
import { getSettings } from './settings';

/**
 * Loopia XML-RPC API Client Wrapper
 * The API requires username and password as the first arguments for every method call.
 */

const client = xmlrpc.createSecureClient({
  host: 'api.loopia.se',
  port: 443,
  path: '/RPCSERV',
});

export const callLoopia = (method: string, args: unknown[] = []): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const settings = getSettings();

    // Check JSON database first, gracefully fallback to ENV if omitted
    const user = settings.loopia?.user || process.env.LOOPIA_API_USER;
    const pass = settings.loopia?.password || process.env.LOOPIA_API_PASSWORD;

    if (!user || !pass) {
      return reject(new Error('Loopia credentials not configured. Please add them in the Settings Dashboard or via .env.local.'));
    }

    const fullArgs = [user, pass, ...args];

    const timeoutId = setTimeout(() => {
      reject(new Error(`Loopia API Timeout [${method}]: Connection exceeded 10 seconds.`));
    }, 10000);

    client.methodCall(method, fullArgs, (error, value) => {
      clearTimeout(timeoutId);
      if (error) {
        console.error(`Loopia API Error [${method}]:`, error);
        reject(error);
      } else if (value === 'AUTH_ERROR') {
        reject(new Error('Authentication Error: Invalid API username or password.'));
      } else {
        resolve(value);
      }
    });
  });
};
