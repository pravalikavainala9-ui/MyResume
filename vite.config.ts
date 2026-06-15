import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function cleanCssPlugin(): Plugin {
  return {
    name: 'clean-css-plugin',
    generateBundle(_, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName];
        if (file.type === 'asset' && file.fileName.endsWith('.css')) {
          let css = file.source as string;

          // 1. Remove "in oklab" from gradients, transitions, etc.
          css = css.replace(/ in oklab/g, '');

          // 2. Replace placeholder color-mix
          css = css.replace(/color-mix\(in oklab,currentcolor 50%,transparent\)/g, '#94a3b8');

          // 3. Match and replace color-mix of variable colors and percentage
          const variableToRgb: Record<string, string> = {
            '--color-blue-50': '239,246,255',
            '--color-blue-100': '219,234,254',
            '--color-blue-200': '191,219,254',
            '--color-blue-300': '147,197,253',
            '--color-blue-500': '59,130,246',
            '--color-indigo-50': '224,231,255',
            '--color-indigo-200': '199,210,254',
            '--color-slate-50': '248,250,252',
            '--color-slate-200': '226,232,240',
            '--color-slate-300': '203,213,225',
            '--color-slate-900': '15,23,42',
            '--color-emerald-50': '236,253,245',
            '--color-emerald-500': '16,185,129',
            '--color-teal-50': '240,253,250',
            '--color-red-50': '254,242,242',
            '--color-white': '255,255,255',
          };

          // Matches color-mix(in oklab, var(--color-*) P%, transparent)
          css = css.replace(/color-mix\(in oklab,var\((--color-[a-z0-9-]+)\)\s*([0-9.]+)%,transparent\)/gi, (match, varName, percent) => {
            const rgb = variableToRgb[varName];
            if (rgb) {
              const alpha = (parseFloat(percent) / 100).toFixed(2);
              return `rgba(${rgb},${alpha})`;
            }
            return match;
          });

          // Matches color-mix(in oklab, var(--color-*) P%, transparent) with spacing variations
          css = css.replace(/color-mix\(in oklab,\s*var\((--color-[a-z0-9-]+)\)\s*([0-9.]+)%,\s*transparent\)/gi, (match, varName, percent) => {
            const rgb = variableToRgb[varName];
            if (rgb) {
              const alpha = (parseFloat(percent) / 100).toFixed(2);
              return `rgba(${rgb},${alpha})`;
            }
            return match;
          });

          // Matches other color-mix variants
          css = css.replace(/color-mix\(in oklab,\s*(#[a-f0-9]+|currentColor|currentcolor)\s*([0-9.]+)%,\s*transparent\)/gi, (match, color, percent) => {
            const alpha = (parseFloat(percent) / 100).toFixed(2);
            if (color.toLowerCase() === 'currentcolor') {
              return `rgba(100,116,139,${alpha})`;
            }
            return match;
          });

          // Matches shadow alpha variables
          css = css.replace(/color-mix\(in oklab,\s*var\((--color-[a-z0-9-]+)\)\s*var\(--tw-shadow-alpha\),\s*transparent\)/gi, (match, varName) => {
            const rgb = variableToRgb[varName];
            if (rgb) {
              return `rgba(${rgb},0.08)`;
            }
            return match;
          });

          file.source = css;
        }
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cleanCssPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
