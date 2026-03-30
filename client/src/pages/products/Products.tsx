import Tabs from "../../design/tabs/Tabs";
import { Section, Sections } from "../../components/section/Section";
import {
  IconSwipeableAds,
  IconCarouselAds,
  IconVideoAds,
  IconGameController,
  IconCheckoutProduct,
  PreviewSwipeableAdSrcSet,
  PreviewCarouselAdSrcSet,
  PreviewVideoAdSrcSet,
  PreviewCheckoutProductSrcSet,
  PreviewSwipeableGameSrcSet,
  PreviewCarouselGameSrcSet,
  PreviewVideoGameSrcSet,
  PreviewCheckoutGameSrcSet,
} from "../../assets/product-images";

import styles from "./Product.module.css";
import { Heading1 } from "../../design/heading/Heading";
import { TextBlock } from "../../design/text-block/TextBlock";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { AdAction } from "./ad-action/AdAction";
import { CheckoutAction } from "./ad-action/CheckoutAction";

export default function Products() {
  return (
    <PageLayout>
      <PageLayout.Content>
        <PageLayout.Hero>
          <img
            width={88}
            height={88}
            src={IconGameController}
            alt="Products Icon"
          />
          <Heading1 xlarge>Gaming Products</Heading1>
          <TextBlock size="xlarge">
            Explore the different products BoltPlay offers within gaming
          </TextBlock>
        </PageLayout.Hero>
        <Tabs
          center
          items={[
            {
              label: "Ads Product",
              value: "ads-product",
              content: <AdsProductContent />,
            },
            {
              label: "Checkout Product",
              value: "checkout-product",
              content: <CheckoutProductContent />,
            },
          ]}
        />
      </PageLayout.Content>
    </PageLayout>
  );
}

function AdsProductContent() {
  return (
    <Sections>
      <Section
        iconUrl={IconSwipeableAds}
        title="Swipe-able Ads"
        description="Players swipe on product cards to like and dislike products to drive higher engagement and in-ad checkout"
        action={
          <AdAction
            url="https://play.staging-bolt.com/interactive"
            label="View Experience"
          />
        }
        preview={
          <Preview
            adSrcSet={PreviewSwipeableAdSrcSet}
            gameSrcSet={PreviewSwipeableGameSrcSet}
          />
        }
      />
      <Section
        iconUrl={IconCarouselAds}
        title="Carousel Ads"
        description="Showcase multiple products in a single scrollable placement, ideal for eCommerce brands and promotions with multiple offers"
        action={
          <AdAction
            url="https://play.staging-bolt.com/carousel"
            label="View Experience"
          />
        }
        preview={
          <Preview
            adSrcSet={PreviewCarouselAdSrcSet}
            gameSrcSet={PreviewCarouselGameSrcSet}
          />
        }
      />
      <Section
        iconUrl={IconVideoAds}
        title="Video Ads"
        description="Full-screen video that plays at natural session breaks, with end cards for direct calls to action"
        action={
          <AdAction
            url="https://play.staging-bolt.com/video"
            label="View Experience"
          />
        }
        preview={
          <Preview
            adSrcSet={PreviewVideoAdSrcSet}
            gameSrcSet={PreviewVideoGameSrcSet}
          />
        }
      />
    </Sections>
  );
}

function CheckoutProductContent() {
  return (
    <Sections>
      <Section
        iconUrl={IconCheckoutProduct}
        title="Checkout Product"
        description="Collect payments in-game without redirecting your user out of the experience"
        action={<CheckoutAction label="View Experience" />}
        preview={
          <Preview
            adSrcSet={PreviewCheckoutProductSrcSet}
            gameSrcSet={PreviewCheckoutGameSrcSet}
          />
        }
      />
    </Sections>
  );
}

function Preview({ adSrcSet, gameSrcSet }: { adSrcSet: string; gameSrcSet: string }) {
  return (
    <div className={styles.preview}>
      <img
        srcSet={adSrcSet}
        sizes="300px"
        className={styles.previewAd}
        alt="Preview Ad"
      />
      <img
        srcSet={gameSrcSet}
        sizes="200px"
        className={styles.previewGame}
        alt="Preview Game"
      />
    </div>
  );
}
