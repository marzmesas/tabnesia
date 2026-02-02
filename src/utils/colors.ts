export interface ColorVariables {
  bg: string;
  text: string;
}

const colors: Record<string, ColorVariables> = {
  grey: { bg: '#707280', text: '#ffffff' },
  blue: { bg: '#4b87ff', text: '#ffffff' },
  red: { bg: '#ff4b4b', text: '#ffffff' },
  yellow: { bg: '#ffbf00', text: '#000000' },
  green: { bg: '#4bff4b', text: '#000000' },
  pink: { bg: '#ff4bff', text: '#ffffff' },
  purple: { bg: '#8f4bff', text: '#ffffff' },
  cyan: { bg: '#4bffff', text: '#000000' },
};

export const getColorVariables = (color: string): ColorVariables => {
  return colors[color] || { bg: '#707280', text: '#ffffff' };
};
