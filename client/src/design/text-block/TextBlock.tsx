import type { JSX } from "preact/jsx-runtime";
import styles from "./TextBlock.module.css";

export interface TextBlockProps {
  size: "small" | "medium" | "large" | "xlarge";
  children: JSX.Element | string;
}

export function TextBlock({ size, children }: TextBlockProps) {
  return <p className={styles[size]}>{children}</p>;
}
