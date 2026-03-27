import { SpinnerIcon } from "../icons/spinner";

import styles from "./Spinner.module.css";

export type SpinnerProps = {
  size?: number;
};

export function Spinner({ size = 24 }: SpinnerProps) {
  return <SpinnerIcon size={size} className={styles.spinner} />;
}
