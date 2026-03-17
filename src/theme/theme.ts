// iOS 26 Liquid Glass + HIG semantic color tokens

// Liquid Glass material values
export const GLASS = {
  navBar:     'rgba(255,255,255,0.01)',  // tint over BlurView
  card:       'rgba(255,255,255,0.78)',  // glass card surface
  cardStrong: 'rgba(255,255,255,0.90)',  // modal / input surface
  border:     'rgba(255,255,255,0.85)',  // glass card border
  separator:  'rgba(60,60,67,0.10)',    // subtle iOS 26 separator
  overlay:    'rgba(0,0,0,0.38)',       // sheet backdrop
  tintBlue:   'rgba(0,122,255,0.10)',   // active-tab or selected background
  tintRed:    'rgba(255,59,48,0.08)',   // destructive background
  shadow: {                             // glass shadow recipe
    color: '#000000',
    offset: { width: 0, height: 2 } as { width: number; height: number },
    opacity: 0.06,
    radius: 12,
  },
  fabShadow: {
    color: '#007AFF',
    offset: { width: 0, height: 6 } as { width: number; height: number },
    opacity: 0.4,
    radius: 16,
  },
} as const;

export const COLORS = {
  // Interactive
  primary:          '#007AFF', // systemBlue
  error:            '#FF3B30', // systemRed
  success:          '#34C759', // systemGreen
  warning:          '#FF9500', // systemOrange

  // Backgrounds
  surface:          '#FFFFFF', // systemBackground
  background:       '#F2F2F7', // systemGroupedBackground

  // Text
  label:            '#000000',
  secondaryLabel:   '#636366',
  tertiaryLabel:    '#AEAEB2',

  // Borders & separators
  outline:          '#C6C6C8',
  separator:        '#C6C6C8',

  // Tonal containers
  primaryContainer: '#E5F0FF',
  successContainer: '#D1F5DC',
  errorContainer:   '#FFE5E3',
  warningContainer: '#FFF3E0',

  // Greyscale aliases used by screens
  grey50:           '#F2F2F7',
  grey100:          '#E5E5EA',
  grey200:          '#C6C6C8',
  grey400:          '#AEAEB2',
  grey600:          '#636366',
  grey900:          '#000000',
};
