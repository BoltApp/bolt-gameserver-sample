import { PageLayout } from "../../components/page-layout/PageLayout";
import { Section, Sections } from "../../components/section/Section";
import { Heading1 } from "../../design/heading/Heading";
import { TextBlock } from "../../design/text-block/TextBlock";

import PreviewUnity from "../../assets/preview-unity.png";

import PreviewJS from "../../assets/preview-js.jpg";

import styles from "./DeveloperSDKs.module.css";
import { LinkButton } from "../../design/button/Button";

export function DevelopmentSDKs() {
  return (
    <PageLayout>
      <PageLayout.Content>
        <PageLayout.Intro>
          <Heading1 xlarge>Developer SDKs</Heading1>
          <TextBlock size="xlarge">
            Integrate ads into your game to generate additional revenue
          </TextBlock>
        </PageLayout.Intro>

        <hr className={styles.divider} />

        <Sections>
          <Section
            title="Unity SDK"
            description="Drop-in monetization for Unity games. Full documentation, sample scenes, and compatibility with Unity 2020.3+"
            action={
              <LinkButton
                href="https://github.com/BoltApp/bolt-unity-sdk"
                target="_blank"
                rel="noopener noreferrer">
                Go to Unity SDK
              </LinkButton>
            }
            preview={
              <img
                src={PreviewUnity}
                className={styles.previewImage}
                alt="Unity SDK Preview"
              />
            }
          />

          <Section
            title="TypeScript SDK"
            description="Integrate BoltPlay's monetization and engagement tools into any HTML5 game with our TypeScript SDK."
            action={
              <LinkButton
                href="https://github.com/BoltApp/bolt-frontend-sdk"
                target="_blank"
                rel="noopener noreferrer">
                Go to TypeScript SDK
              </LinkButton>
            }
            preview={
              <img
                src={PreviewJS}
                className={styles.previewImage}
                alt="TypeScript SDK Preview"
              />
            }
          />
        </Sections>
      </PageLayout.Content>
    </PageLayout>
  );
}
