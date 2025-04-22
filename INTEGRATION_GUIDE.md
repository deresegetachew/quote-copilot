

---

## 🔧 Shared Configuration Notes (Temporary Setup)

Currently, we are using a `local.config.yml` file **per app** (e.g. `email-workers`, `tooling-cli`) to store Gmail integration credentials and scopes.

These values are **duplicated** temporarily across apps due to separation of concerns, but we plan to centralize this configuration under a shared path like `config/local.config.yml` soon.

### 📁 Example (per-app local.config.yml)
```yaml
gmailConfig:
  clientId: "your-google-client-id"
  clientSecret: "your-google-client-secret"
  redirectUri: "http://localhost:8690/oauth2callback"
  refreshToken: "..."
  scopes:
    - "https://www.googleapis.com/auth/gmail.readonly"
```

### 🌱 Mapped Environment Variables (used for `process.env`)
| Key                   | Description                             |
|-----------------------|-----------------------------------------|
| `GOOGLE_CLIENT_ID`    | OAuth Client ID for Gmail API           |
| `GOOGLE_CLIENT_SECRET`| OAuth Client Secret                     |
| `GOOGLE_REDIRECT_URI` | Redirect URI for token exchange         |
| `GOOGLE_REFRESH_TOKEN`| Long-lived refresh token (per account)  |

In the future, these will be loaded from a **shared config loader** or secure secrets management layer (like Vault, SOPS, or Doppler).