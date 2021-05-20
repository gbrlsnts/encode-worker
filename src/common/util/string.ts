export const rtrimChar = (string: string, char: string): string => {
  if (string.endsWith(char)) {
    string = string.substring(0, string.length - 1);
  }

  return string;
};
