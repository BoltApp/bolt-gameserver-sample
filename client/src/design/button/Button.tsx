import type { JSX } from "preact/jsx-runtime";

import styles from "./Button.module.css";

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  return <button {...props} className={styles.button}></button>;
}
