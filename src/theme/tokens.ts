export const colors = {
  tomato: '#E14B3B',
  leaf: '#3F8C5B',
  cream: '#F3F1E8',
  charcoal: '#2C2C2C',
  charcoalSoft: '#4A4A4A',
  line: '#D9D6CA',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  family: {
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    fallback: 'System',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  lineHeight: {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 34,
    xxl: 44,
  },
} as const;

export const tokens = {
  colors,
  spacing,
  radius,
  typography,
} as const;
