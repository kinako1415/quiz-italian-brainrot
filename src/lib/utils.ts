export const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");
