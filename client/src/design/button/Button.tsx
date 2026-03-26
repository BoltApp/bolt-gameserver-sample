import type { JSX } from "preact/jsx-runtime";

import styles from "./Button.module.css";

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
};

export function Button(props: ButtonProps) {
  return <button {...props} className={styles.button}></button>;
}

export type LinkButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

export function LinkButton(props: LinkButtonProps) {
  return <a {...props} className={styles.button}></a>;
}
