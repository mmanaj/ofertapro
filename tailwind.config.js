/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'sys-blue':       '#007AFF',
        'sys-red':        '#FF3B30',
        'sys-green':      '#34C759',
        'sys-orange':     '#FF9500',
        'sys-bg':         '#FFFFFF',
        'sys-grouped':    '#F2F2F7',
        'sys-label':      '#000000',
        'sys-label2':     '#636366',
        'sys-label3':     '#AEAEB2',
        'sys-sep':        '#C6C6C8',
        'sys-fill':       '#78788033',
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
        'title1':      ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'title2':      ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'headline':    ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'body':        ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'subhead':     ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote':    ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption1':    ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'caption2':    ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
