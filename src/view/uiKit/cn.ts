function cn(...classNames: (string | null | undefined | boolean | number)[]): string {
  return classNames.filter(className => !!className).join(' ');
}

export default cn;