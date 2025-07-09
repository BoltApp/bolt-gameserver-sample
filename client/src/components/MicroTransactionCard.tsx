import className from "classnames";
import type { CoinPackage } from "../pages/types";
import Gem from "../assets/itemicon_diamond_blue.png";
import Star from "../assets/star.png";
import FlashEffect from "..//assets/Image_Effect_Rotate_0.png";

const formatCoins = (coins: number) => {
  return new Intl.NumberFormat("en-US").format(coins);
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

interface MicroTransactionCardProps {
  package: CoinPackage;
  selected: boolean;
  onClick: (pkg: CoinPackage) => void;
}

export function MicroTransactionCard({
  package: pkg,
  selected,
  onClick,
}: MicroTransactionCardProps) {
  const offsetX = pkg.offsetX ?? 50;
  const offsetY = pkg.offsetY ?? 0;
  const scale = pkg.scale ?? 0.5;
  return (
    <button
      className={className("coin-package", `tier-${pkg.tier}`, {
        popular: pkg.popular,
        selected: selected,
      })}
      style={`
        --scale: ${scale};
        --offset-x: ${offsetX}%;
        --offset-y: ${offsetY}%;
      `}
      onClick={() => onClick(pkg)}>
      <img
        className="flash-effect"
        src={FlashEffect}
        alt="Flash Effect"
        style={`
          z-index: -1;
          opacity: 0.0;
          position: absolute;
          width: 150%;
          top: 10px;
          left: -25%;
          `}
      />
      <img className="product-image" src={pkg.imageUrl} alt={pkg.name} />

      {pkg.popular && (
        <div className="popular-badge">
          <img src={Star} alt="Popular Badge" className="icon" />
          <span>Most Popular</span>
        </div>
      )}
      {/* {pkg.popular && (
        <img className="popular-badge" src={Ribbon} alt="Popular Badge" />
      )} */}

      {pkg.savings && <div className="savings-badge">{pkg.savings}</div>}

      <div className="coin-package-header">
        <h3>{pkg.name}</h3>
        <div className="coins-display">
          {formatCoins(pkg.coins + (pkg.bonus ?? 0))}
          <img src={Gem} alt="Gems Icon" className="icon" />
          {/* {pkg.bonus && (
            <div className="bonus-amount">
              {`+${formatCoins(pkg.bonus)} Bonus`}
            </div>
          )} */}
        </div>
      </div>

      <div className="coin-package-content">
        <div className="price-display">
          <div className="price-value">{formatPrice(pkg.price)}</div>
        </div>
      </div>
    </button>
  );
}
