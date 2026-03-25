import { Button } from "../../design/button/Button";
import { Heading1 } from "../../design/heading/Heading";
import { TextBlock } from "../../design/text-block/TextBlock";

import styles from "./Section.module.css";

export interface SectionProps {
  iconUrl: string;
  title: string;
  description: string;
  experienceUrl: string;
  previewAdUrl: string;
  previewGameUrl: string;
}

export function Section(props: SectionProps) {
  const { iconUrl, title, description, previewAdUrl, previewGameUrl } = props;
  return (
    <section className={styles.section}>
      <div className={styles.sectionContent}>
        <img src={iconUrl} width={88} height={88} alt="Swipe-able Ads" />
        <Heading1 large>{title}</Heading1>
        <TextBlock size="large">{description}</TextBlock>

        <Button>View Experience</Button>
      </div>

      <div className={styles.preview}>
        <img src={previewAdUrl} className={styles.previewAd} alt="Preview Ad" />
        <img
          src={previewGameUrl}
          className={styles.previewGame}
          alt="Preview Game"
        />
      </div>
    </section>
  );
}
