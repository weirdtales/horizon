import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ModuleManifest {
    id: string;
    name: string;
    description?: string;
    icon: string; // Lucide icon name as string
    color: string;
    version: string;
    author?: string;
    
    // Optional Capabilities
    hasWidget?: boolean;
    hasView?: boolean;
    
    // Configuration Schema
    configFields?: ConfigField[];
}

export interface ConfigField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'url';
    placeholder?: string;
    defaultValue?: any;
    helpText?: string;
}

export interface ModuleDefinition<TSettings = any> extends ModuleManifest {
    widget?: (props: { settings: TSettings }) => ReactNode;
    view?: (props: { settings: TSettings }) => ReactNode;
}
