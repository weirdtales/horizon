/**
 * Extremely strict URL sanitizer to prevent DOM-based XSS and Open Redirects.
 * Blocks javascript:, data:, and other non-web protocols.
 */
export function sanitizeUrl(url: string | undefined | null, fallback: string = 'about:blank'): string {
    if (!url) return fallback;

    // Mitigate ReDoS by limiting length
    if (url.length > 2048) {
        console.warn(`[Security] URL blocked: length exceeds 2048 characters.`);
        return fallback;
    }

    // Remove any non-printable characters or whitespace
    const cleaned = url.trim().replace(/[^\x20-\x7E]/g, '');

    // Check for common malicious protocols
    // We use a regex that handles case-insensitivity and variations
    // Hardened to block blob: as well
    if (/^(javascript|data|vbscript|file|blob):/i.test(cleaned)) {
        try {
            const urlObj = new URL(cleaned);
            console.warn(`[Security] Blocked malicious protocol: ${urlObj.protocol} from ${urlObj.hostname || 'unknown'}`);
        } catch {
            console.warn(`[Security] Blocked malicious URL protocol in unparseable string.`);
        }
        return fallback;
    }

    // Allow http, https, and internal relative paths (/)
    // Protocol-relative (//) is restricted to prevent Open Redirects to arbitrary domains
    if (/^https?:\/\//i.test(cleaned)) {
        try {
            return new URL(cleaned).toString();
        } catch {
            return fallback;
        }
    }

    if (cleaned.startsWith('/') && !cleaned.startsWith('//')) {
        return cleaned;
    }

    // If it doesn't have a protocol but looks like a domain, prepend https://
    // This is a convenience for user settings. 
    // Uses safer anchors to avoid ReDoS on complex hostnames.
    if (/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+\.?[a-z]{2,}(:[0-9]+)?(\/.*)?$/i.test(cleaned)) {
        try {
            return new URL(`https://${cleaned}`).toString();
        } catch {
            return fallback;
        }
    }

    // If it's a localhost URL, allow it
    if (/^localhost(:[0-9]+)?(\/.*)?$/i.test(cleaned)) {
        return `http://${cleaned}`;
    }

    // If it looks like an IP address, allow it (stricter IPv4 check)
    if (/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}(:[0-9]+)?(\/.*)?$/.test(cleaned)) {
        return `http://${cleaned}`;
    }

    // Default fallback for ambiguous strings
    return fallback;
}

/**
 * Safer text sanitizer for general display strings (not URLs).
 * Prevents basic HTML injection for display text but is NOT safe for 
 * insertion into unquoted or single-quoted HTML attributes.
 */
export function sanitizeText(text: string | undefined | null, fallback: string = ''): string {
    if (text === null || text === undefined) return fallback;
    // Support Unicode letters/numbers, plus common safe punctuation: . - : , ! ? ( ) [ ] /
    // Explicitly excludes single quote (') and double quote (")
    return text.toString().replace(/[^\p{L}\p{N}\s.\-:,!?( )[\]\/]/gu, '').trim();
}
