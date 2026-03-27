import type { JSX } from "preact/jsx-runtime";
import { Heading1 } from "../../design/heading/Heading";
import { TextBlock } from "../../design/text-block/TextBlock";

import styles from "./Section.module.css";

export interface SectionProps {
  iconUrl?: string;
  iconSize?: number;
  title: string;
  description: string;
  action: JSX.Element;
  preview: JSX.Element | JSX.Element[];
}

export function Section(props: SectionProps) {
  const { iconUrl, iconSize, title, description, action, preview } = props;
  return (
    <section className={styles.section}>
      <div className={styles.sectionContent}>
        {iconUrl && <img src={iconUrl} height={iconSize ?? 80} alt={title} />}
        <Heading1 large>{title}</Heading1>
        <TextBlock size="large">{description}</TextBlock>

        {action}
      </div>

      {preview}
    </section>
  );
}

export interface SectionsProps {
  children: JSX.Element | JSX.Element[];
}

export function Sections({ children }: SectionsProps) {
  return <div className={styles.sections}>{children}</div>;
}
