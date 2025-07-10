import { useState } from "preact/hooks";
import "./MicroTransactionStore.css";
import type { GemPackage } from "./types";
import { gemPackages } from "../packages";
import { MicroTransactionCard } from "../components/MicroTransactionCard";
import TreasuryRoomBg from "../assets/treasury-room.png";

import { Charge } from "@boltpay/bolt-js";

export function MicroTransactionStore() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePackageClick = async (pkg: GemPackage) => {
    console.log("Package clicked:", {
      id: pkg.id,
      name: pkg.name,
      coins: pkg.coins,
      price: pkg.price,
      totalCoins: pkg.coins + (pkg.bonus || 0),
    });
    setSelectedPackage(pkg.id);

    const result = await Charge.checkout(pkg.bceLink);

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
              key={pkg.id}
              package={pkg}
              selected={selectedPackage === pkg.id}
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
