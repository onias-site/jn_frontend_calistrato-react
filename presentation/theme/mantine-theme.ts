import { createTheme, rem } from '@mantine/core';

// as mesmas cores do tailwind.config.js (template Vristo): o primary #4361ee é a tonalidade 6 desta escala
const primary: [string, string, string, string, string, string, string, string, string, string] = [
    '#eef1fe',
    '#dbe1fc',
    '#b6c3f9',
    '#8fa3f6',
    '#6d87f3',
    '#5572f0',
    '#4361ee',
    '#3450d4',
    '#2d46bd',
    '#243aa6',
];

export const mantineTheme = createTheme({
    fontFamily: 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif',
    primaryColor: 'primary',
    primaryShade: 6,
    colors: { primary },
    defaultRadius: 'md',
    fontSizes: {
        xs: rem(12),
        sm: rem(14),
        md: rem(15),
        lg: rem(17),
        xl: rem(20),
    },
    components: {
        Modal: {
            defaultProps: {
                centered: true,
                radius: 'md',
                overlayProps: { backgroundOpacity: 0.45, blur: 2 },
            },
            styles: {
                title: { fontWeight: 700, fontSize: 'var(--mantine-font-size-lg)' },
            },
        },
        Tooltip: {
            defaultProps: { withArrow: true },
        },
    },
});
