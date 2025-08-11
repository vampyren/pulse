
/* Pulse Web — tailwind.config.ts
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Tailwind CSS configuration.
 */
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['index.html', './src/**/*{ts,tsx}'],
  theme: { extend: { } },
  plugins: []
} satisfies Config
