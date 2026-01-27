export const colors = {
  primary: '#DD3B37',
  secondaryYellow: '#DEDE3F',
  secondaryBlue: '#3EACFA',
  textDark: '#081E25',
  background: '#F6F8F9',
  white: '#FFFFFF',
  line: '#E3E7EA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
} as const;

export const typography = {
  family: {
    primary: 'Satoshi',
    regular: 'Satoshi',
    medium: 'Satoshi',
    bold: 'Satoshi',
    fallback: 'System',
  },
  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
} as const;

export const tokens = {
  colors,
  spacing,
  radius,
  typography,
} as const;
