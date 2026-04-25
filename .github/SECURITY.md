# 🛡️ Security Policy

## Supported Versions

We actively provide security updates for the following versions of **Horizon Dashboard**:

| Version | Supported          |
| ------- | ------------------ |
| 1.4.x   | ✅ Active Support   |
| < 1.4.0 | ❌ Outdated         |

We strongly recommend always running the latest stable release to ensure your dashboard and infrastructure remain protected.

## Our Commitment to Security

Horizon is designed with a **"Security at Inception"** philosophy. Because this dashboard interacts with sensitive homelab infrastructure (Plex, Cloudflare, Proxmox, etc.), we implement several layers of protection:

- **Strict Input Sanitization**: All user-provided URLs and inputs are sanitized to prevent XSS and SSRF.
- **Dependency Auditing**: Continuous scanning via Snyk and GitHub Dependabot.
- **Environment Isolation**: Sensitive credentials are kept server-side and never exposed to the client.
- **Safe Defaults**: Docker and Bare-metal deployments use non-root users where possible.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security-related bug or vulnerability, please use one of the following private channels:

1. **GitHub Private Vulnerability Reporting**: Navigate to the "Security" tab of this repository and select "Report a vulnerability". This is the preferred method as it allows for secure collaboration.
2. **Email**: Send a detailed report to `security@weirdtales.io`.

### What to include in your report:
- A descriptive title.
- Impact: What could an attacker achieve?
- Steps to reproduce (POC).
- Any potential fix or mitigation you have identified.

## Disclosure Policy

Once a report is received:
1. We will acknowledge receipt of your report within **48 hours**.
2. We will conduct a thorough investigation and provide a timeline for a fix.
3. We will notify you once the vulnerability is resolved.
4. We aim to release a patched version within **7-14 days** for critical issues.

## Preferred Languages

We prefer reports in **English**, but we will do our best to process reports in other languages using translation tools.

---

*Built with security in mind by the [Weirdtales](https://github.com/weirdtales) team.*
