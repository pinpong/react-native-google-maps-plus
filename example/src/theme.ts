export const lightTheme = {
  theme: 'light',
  bgPrimary: '#FFFFFF',
  bgAccent: '#3B82F6',
  bgHeader: '#E5E7EB',
  textPrimary: '#111827',
  textOnAccent: '#FFFFFF',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  label: '#222',
  placeholder: '#9CA3AF',
  border: '#D1D5DB',
  inputBg: '#FFFFFF',
  buttonBg: '#3B82F6',
  cancelBg: '#9CA3AF',
  errorBorder: '#ff0000',
};

export const darkTheme = {
  theme: 'dark',
  bgPrimary: '#1E1E1E',
  bgAccent: '#2D6BE9',
  bgHeader: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
  label: '#D1D5DB',
  placeholder: '#6B7280',
  border: '#3F3F46',
  inputBg: '#2C2C2E',
  buttonBg: '#2D6BE9',
  cancelBg: '#4B5563',
  errorBorder: '#ff0000',
};

export type AppTheme = typeof lightTheme;
