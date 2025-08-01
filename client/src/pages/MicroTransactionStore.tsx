import { useState } from "preact/hooks";
import "./MicroTransactionStore.css";
import type { GemPackage } from "../types";
import { MicroTransactionCard } from "../components/MicroTransactionCard";
import TreasuryRoomBg from "../assets/treasury-room.png";

import { Charge } from "@boltpay/bolt-js";
import { getCheckoutLink, useGetAllProducts } from "../endpoints";

export function MicroTransactionStore() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const { data: gemPackages, isLoading } = useGetAllProducts();

  if (isLoading || !gemPackages) {
    return <div>Loading...</div>;
  }

  const handlePackageClick = async (pkg: GemPackage) => {
    console.log("Package clicked:", {
      tier: pkg.tier,
      name: pkg.name,
      gems: pkg.gemAmount,
      price: pkg.price,
    });
    setSelectedPackage(pkg.tier);

    const checkoutLink = await getCheckoutLink(pkg.sku);
    const result = await Charge.checkout(checkoutLink);

    if (result.status === "success") {
      console.log(
        "Purchase completed for:",
        pkg.name,
        result.payload.reference
      );
    } else {
      console.log("Purchase cancelled:");
    }
    setSelectedPackage(null);
  };
  return (
    <div className="coin-store" style={`--store-bg: url(${TreasuryRoomBg})`}>
      <div className="coin-store-content">
        <div className="coin-store-header">
          <h1>Royal Gem Treasury</h1>
          <p>Enhance thy medieval adventures with precious gems</p>
        </div>

        <div className="coin-packages-grid">
          {gemPackages.map((pkg) => (
            <MicroTransactionCard
              key={pkg.tier}
              package={pkg}
              selected={selectedPackage === pkg.tier}
              onClick={handlePackageClick}
            />
          ))}
        </div>
      </div>
      <div className="coin-store-footer">
        <p>
          <span className="secure-icon">🏰</span>
          Secure payment powered by industry-standard encryption (and ancient
          magic)
        </p>
      </div>
    </div>
  );
}
