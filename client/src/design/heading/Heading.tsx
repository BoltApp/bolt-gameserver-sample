import type { JSX } from "preact/jsx-runtime";

import styles from "./Heading.module.css";

export interface Heading1Props {
  large?: boolean; // only for h1
  xlarge?: boolean; // only for h1
}

export function Heading1({
  large,
  xlarge,
  children,
}: Heading1Props & JSX.HTMLAttributes<HTMLHeadingElement>) {
  let className = styles.heading1;
  if (large) {
    className += ` ${styles.large}`;
  }
  if (xlarge) {
    className += ` ${styles.xlarge}`;
  }

  return <h1 className={className}>{children}</h1>;
}

export function Heading2({ children }: JSX.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={styles.heading2}>{children}</h2>;
}
