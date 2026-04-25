import fs from 'fs';
import path from 'path';

const modulesDir = path.join(process.cwd(), 'modules');
const registryPath = path.join(process.cwd(), 'lib', 'registry.ts');

const modules = fs.readdirSync(modulesDir).filter(f => {
    const fullPath = path.join(modulesDir, f);
    if (!fs.statSync(fullPath).isDirectory()) return false;
    
    const manifestPath = path.join(fullPath, 'module.json');
    if (!fs.existsSync(manifestPath)) return false;

    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const mandatory = ['id', 'name', 'icon', 'color'];
        const missing = mandatory.filter(key => !manifest[key]);
        
        if (missing.length > 0) {
            console.warn(`⚠️  Module [${f}] skipped: Missing mandatory fields: ${missing.join(', ')}`);
            return false;
        }

        if (manifest.id !== f) {
            console.warn(`⚠️  Module [${f}] skipped: Directory name must match manifest id "${manifest.id}"`);
            return false;
        }

        return true;
    } catch (e) {
        console.error(`❌ Module [${f}] has invalid module.json:`, e.message);
        return false;
    }
});

let imports = "import dynamic from 'next/dynamic';\nimport React from 'react';\n\n";
let manifests = "export const MODULE_MANIFESTS = [\n";
let widgets = "export const MODULE_WIDGETS: Record<string, any> = {\n";
let views = "export const MODULE_VIEWS: Record<string, any> = {\n";

modules.forEach(m => {
    const manifestPath = path.join(modulesDir, m, 'module.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const varName = m.replace(/-/g, '_').replace(/^[0-9]/, '_$&');

    imports += `import ${varName}Manifest from '@/modules/${m}/module.json';\n`;
    manifests += `    ${varName}Manifest,\n`;
    
    // Check if widget exists and match manifest
    if (fs.existsSync(path.join(modulesDir, m, 'widget.tsx'))) {
        widgets += `    '${m}': dynamic(() => import('@/modules/${m}/widget')),\n`;
        if (manifest.hasWidget === false) {
            console.warn(`ℹ️  Module [${m}]: has widget.tsx but manifest says hasWidget=false. Enforcing true.`);
        }
    } else if (manifest.hasWidget) {
        console.warn(`⚠️  Module [${m}]: manifest says hasWidget=true but widget.tsx is missing.`);
    }
    
    // Check if view exists and match manifest
    if (fs.existsSync(path.join(modulesDir, m, 'view.tsx'))) {
        views += `    '${m}': dynamic(() => import('@/modules/${m}/view')),\n`;
        if (manifest.hasView === false) {
            console.warn(`ℹ️  Module [${m}]: has view.tsx but manifest says hasView=false. Enforcing true.`);
        }
    } else if (manifest.hasView) {
        console.warn(`⚠️  Module [${m}]: manifest says hasView=true but view.tsx is missing.`);
    }
});

manifests += "];\n\n";
widgets += "};\n\n";
views += "};\n\n";

const content = `${imports}\n${manifests}${widgets}${views}
export function getModuleManifest(id: string) {
    return MODULE_MANIFESTS.find(m => m.id === id);
}
`;

fs.writeFileSync(registryPath, content);
console.log(`✅ Module registry generated successfully (${modules.length} modules registered).`);
