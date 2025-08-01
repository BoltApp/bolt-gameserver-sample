import { useState } from "preact/hooks";
import { toast } from "react-toastify";

import "./MicroTransactionStore.css";
import type { GemPackage } from "../types";
import { MicroTransactionCard } from "../components/MicroTransactionCard";
import TreasuryRoomBg from "../assets/treasury-room.png";

import { Charge } from "@boltpay/bolt-js";
import { useGetAllProducts, useValidateUser } from "../endpoints";

export function MicroTransactionStore() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const { data: gemPackages, isLoading } = useGetAllProducts();
  const { mutate: validateUser } = useValidateUser();

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

    const result = await Charge.checkout(pkg.checkoutLink);

    if (result.status === "success") {
      console.log(
        "Purchase completed for:",
        pkg.name,
        result.payload.reference
      );
      validateUser(result.payload.reference, {
        onSuccess: (data) => {
          toast.success(`Successfully purchased ${pkg.gemAmount} gems!`);
          console.log("User validated:", data);
        },
        onError: (error) => {
          toast.error(`Failed to validate purchase: ${error.message}`);
          console.error("Validation error:", error);
        },
      });
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
