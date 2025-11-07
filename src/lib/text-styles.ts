// src/lib/text-styles.ts
export const textStyles = {
  default: 'text-text-default',
  subtle: 'text-text-subtle',
  emphasis: 'text-text-emphasis',
  inverse: 'text-text-inverse',
  bookTitle: 'text-text-emphasis', // Book titles in green
  bookAuthor: 'text-text-subtle', // Authors in subtle gray
  metadata: 'text-text-subtle', // ISBN, publisher in subtle gray
  credit: 'text-text-subtle', // Credits in subtle gray
  warning: 'text-red-500', // Warnings in red
  success: 'text-green-500', // Success messages in green
} as const;