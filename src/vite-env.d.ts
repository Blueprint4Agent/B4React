/// <reference types="vite/client" />

/** Validated public, immutable build-time identity; never contains credentials. */
declare const __PROJECT_BRAND__: {
    version: 1;
    name: string;
    short_name: string;
    identifier: string;
    logo_url?: string;
    logo_dark_url?: string;
} | null;
