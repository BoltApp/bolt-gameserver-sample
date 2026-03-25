import Tabs from "../../design/tabs/Tabs";
import { Section } from "./Section";

import IconSwipeableAds from "../../assets/icon-swipeable-ads.png";
import PreviewSwipeableAd from "../../assets/preview-swipeable-ad.png";
import PreviewSwipeableGame from "../../assets/preview-swipeable-game.png";

import IconCarouselAds from "../../assets/icon-carousel-ads.png";
import PreviewCarouselAd from "../../assets/preview-carousel-ad.png";
import PreviewCarouselGame from "../../assets/preview-video-game.jpg";

import IconVideoAds from "../../assets/icon-video-ads.png";
import PreviewVideoAd from "../../assets/preview-video-ad.png";
import PreviewVideoGame from "../../assets/preview-video-game.jpg";

import IconGameController from "../../assets/icon-game-controller.png";

import IconCheckoutProduct from "../../assets/icon-checkout-product.png";
import PreviewCheckoutProduct from "../../assets/preview-checkout-product.png";
import PreviewCheckoutGame from "../../assets/preview-checkout-game.png";

import styles from "./Product.module.css";
import { Heading1 } from "../../design/heading/Heading";
import { TextBlock } from "../../design/text-block/TextBlock";

export default function Products() {
  return (
    <div className={styles.page}>
      <div className={styles.mainContent}>
        <section className={styles.hero}>
          <img
            width={88}
            height={88}
            src={IconGameController}
            alt="Products Icon"
            className={styles.heroIcon}
          />
          <Heading1 xlarge>Gaming Products</Heading1>
          <TextBlock size="xlarge">
            Explore the different products BoltPlay offers within gaming
          </TextBlock>
        </section>
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
      </div>
    </div>
  );
}

function AdsProductContent() {
  return (
    <div className={styles.sections}>
      <Section
        iconUrl={IconSwipeableAds}
        title="Swipe-able Ads"
        description="Players swipe on product cards to like and dislike products to drive higher engagement and in-ad checkout"
        experienceUrl=""
        previewAdUrl={PreviewSwipeableAd}
        previewGameUrl={PreviewSwipeableGame}
      />
      <Section
        iconUrl={IconCarouselAds}
        title="Carousel Ads"
        description="Showcase multiple products in a single scrollable placement, ideal for eCommerce brands and promotions with multiple offers"
        experienceUrl=""
        previewAdUrl={PreviewCarouselAd}
        previewGameUrl={PreviewCarouselGame}
      />
      <Section
        iconUrl={IconVideoAds}
        title="Video Ads"
        description="Full-screen video that plays at natural session breaks, with end cards for direct calls to action"
        experienceUrl=""
        previewAdUrl={PreviewVideoAd}
        previewGameUrl={PreviewVideoGame}
      />
    </div>
  );
}

function CheckoutProductContent() {
  return (
    <div className={styles.sections}>
      <Section
        iconUrl={IconCheckoutProduct}
        title="Checkout Product"
        description="Collect payments in-game without redirecting your user out of the experience"
        experienceUrl=""
        previewAdUrl={PreviewCheckoutProduct}
        previewGameUrl={PreviewCheckoutGame}
      />
    </div>
  );
}
