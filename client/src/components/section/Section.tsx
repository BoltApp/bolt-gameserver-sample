import type { JSX } from "preact/jsx-runtime";
import { Button } from "../../design/button/Button";
import { Heading1 } from "../../design/heading/Heading";
import { TextBlock } from "../../design/text-block/TextBlock";

import styles from "./Section.module.css";

export interface SectionProps {
  iconUrl: string;
  title: string;
  description: string;
  experience: {
    url: string;
    label: string;
  };
  preview: JSX.Element | JSX.Element[];
}

export function Section(props: SectionProps) {
  const { iconUrl, title, description, experience, preview } = props;
  return (
    <section className={styles.section}>
      <div className={styles.sectionContent}>
        <img src={iconUrl} height={80} alt="Swipe-able Ads" />
        <Heading1 large>{title}</Heading1>
        <TextBlock size="large">{description}</TextBlock>

        <Button>{experience.label}</Button>
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
