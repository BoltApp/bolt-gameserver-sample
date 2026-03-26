import { PageLayout } from "../../components/page-layout/PageLayout";
import { Section, Sections } from "../../components/section/Section";
import { Heading1 } from "../../design/heading/Heading";
import { TextBlock } from "../../design/text-block/TextBlock";

import IconUnity from "../../assets/icon-unity.png";
import PreviewUnity from "../../assets/preview-unity.png";

import IconJS from "../../assets/icon-js.png";
import PreviewJS from "../../assets/preview-js.jpg";

import styles from "./DeveloperSDKs.module.css";

export function DevelopmentSDKs() {
  return (
    <PageLayout>
      <PageLayout.Content>
        <PageLayout.Hero>
          <Heading1 xlarge>Developer SDKs</Heading1>
          <TextBlock size="xlarge">
            Integrate ads into your game to generate additional revenue
          </TextBlock>
        </PageLayout.Hero>

        <hr className={styles.divider} />

        <Sections>
          <Section
            iconUrl={IconUnity}
            title="Unity SDK"
            description="Drop-in monetization for Unity games. Full documentation, sample scenes, and compatibility with Unity 2020.3+"
            experience={{
              url: "",
              label: "Go to Unity SDK",
            }}
            preview={
              <img src={PreviewUnity} width="400px" alt="Unity SDK Preview" />
            }
          />

          <Section
            iconUrl={IconJS}
            title="TypeScript SDK"
            description="Integrate BoltPlay's monetization and engagement tools into any HTML5 game with our TypeScript SDK."
            experience={{
              url: "",
              label: "Go to TypeScript SDK",
            }}
            preview={
              <img src={PreviewJS} width="400px" alt="TypeScript SDK Preview" />
            }
          />
        </Sections>
      </PageLayout.Content>
    </PageLayout>
  );
}
