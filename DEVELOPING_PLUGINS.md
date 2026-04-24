# 🛠️ Developing Modules for Horizon

Horizon Dashboard uses a modular plugin architecture. Each module is a self-contained unit consisting of a manifest, a dashboard widget, and optionally a full-page view.

## 📁 Module Structure

All modules reside in the `/modules/[id]/` directory.

```text
/modules/my-plugin/
├── module.json    # Manifest: metadata and configuration fields
├── widget.tsx     # React component: the grid widget
├── view.tsx       # (Optional) Full-page view component
├── icon.png       # (Optional) Custom icon for the registry
└── components/    # (Optional) Module-specific shared components
```

---

## 📄 1. The Manifest (`module.json`)

The manifest defines how Horizon interacts with your module.

> [!IMPORTANT]
> The following fields are **mandatory**. Modules missing these fields will be skipped during registration.

```json
{
    "id": "my-plugin",        // Must match the directory name
    "name": "My Plugin",      // Display name in settings
    "icon": "Zap",            // Lucide icon name
    "color": "#9333ea",       // Hex accent color
    "version": "1.0.0",
    "hasWidget": true,
    "hasView": true,
    "configFields": [ ... ]
}
```

### Manifest Schema & Guards
- **`id` (Mandatory)**: Unique identifier (kebab-case). **Note**: The folder name must match this ID exactly.
- **`name` (Mandatory)**: The human-readable name shown in the dashboard and settings.
- **`icon` (Mandatory)**: [Lucide React](https://lucide.dev/icons/) icon name.
- **`color` (Mandatory)**: Primary accent color used for the icon background and highlights.
- **`hidden` (Optional)**: If `true`, the module is hidden from end-user navigation and settings lists (useful for templates or internal utilities).
- **`configFields`**: UI fields generated in the **Settings** dialog.
  - Types: `text`, `password`, `select`, `number`.

### 🛡️ Opt-In Model
All modular views follow a strict **Opt-In** model. A plugin will **never** appear in the sidebar navigation unless:
1. It is explicitly **Enabled** in the **Settings > Plugins** tab.
2. It has a corresponding `view.tsx` file registered in the system.
3. It is not marked as `hidden: true`.

---

## 🧩 2. The Widget (`widget.tsx`)

Widgets are rendered within the dashboard's bento grid.

### Key Hooks & Patterns
- `useService(serviceId, pollInterval)`: Built-in hook for fetching data from an API route.
- `settings`: The component receives its specific configuration as a prop.

```tsx
"use client";

import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { useService } from '@/app/hooks/useService';

export default function MyWidget({ settings }: { settings?: any }) {
    const { data, loading, error } = useService('my-plugin', 60000);
    
    // Access user-configured settings
    const apiKey = settings?.apiKey;

    if (loading) return <Loader2 className="animate-spin" />;
    if (error) return <div>Error connecting to service</div>;

    return (
        <div style={{ padding: '24px' }}>
            <Zap color="var(--md-sys-color-primary)" />
            <h3>Status: {data?.status}</h3>
        </div>
    );
}
```

---

## 🖼️ 3. The Full View (`view.tsx`)

If `hasView` is `true`, your module becomes accessible via `sidebar` and `dashboard` click-throughs. Use the `BackButton` and standard layout patterns for consistency.

```tsx
"use client";

import { BackButton } from '@/app/components/BackButton';

export default function MyFullView() {
    return (
        <div style={{ padding: '48px' }}>
            <header>
                <BackButton />
                <h1>Advanced Metrics</h1>
            </header>
            {/* Your complex UI here */}
        </div>
    );
}
```

---

## 🎨 4. Design Guidelines

Horizon uses **Material Design 3 (MD3)**. To ensure your module feels native:

1. **Use CSS Variables**: 
   - `var(--md-sys-color-surface)`
   - `var(--md-sys-color-primary)`
   - `var(--md-sys-color-outline-variant)`
2. **Glassmorphism**: Use `var(--glass-bg)` and `var(--glass-blur)` for floating elements.
3. **Animations**: Utilize `fadeIn` and `slideUpScale` keyframes for transitions.
4. **Icons**: Always use `lucide-react` for iconography.

---

## 🚀 5. Registration & Testing

### Validation Guards
The registry generator performs the following checks:
1. **Field Check**: Ensures `id`, `name`, `icon`, and `color` exist.
2. **Path Integrity**: Ensures the directory name matches the `id` in the manifest.
3. **Presence Verification**: Warns if `hasWidget` or `hasView` is true but the corresponding `.tsx` file is missing.
4. **Iframe Logic**: If a module has a URL configured but NO native `view.tsx`, the system automatically wraps it in a premium iframe wrapper (`/view?url=...`). If a native `view.tsx` exists, the system renders it directly.
5. **Enforcement**: If a `.tsx` file exists but its flag is `false`, the system will automatically register it and issue an info log.

---

### Installation via Zip
To package your module for sharing:
```bash
zip -r my-plugin.zip modules/my-plugin/
```
Users can then upload this `.zip` via the **Settings > Plugins** interface.

---

## 🛡️ Best Practices
- **Defensive Coding**: Always check for `null` or `undefined` in `data` and `settings`.
- **Async Safety**: Use `AbortController` in custom `useEffect` fetches.
- **TLS Rejection**: Never globally disable SSL verification; use the project's internal `fetch` wrappers.
- **Mobile First**: Use the `useMobile()` hook to adjust layouts for smaller screens.
