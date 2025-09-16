import { useState } from "preact/hooks";
import { toast } from "react-toastify";

import "./MicroTransactionStore.css";
import type { GemPackage } from "../types";
import { MicroTransactionCard } from "../components/MicroTransactionCard";
import TreasuryRoomBg from "../assets/treasury-room.png";

import { BoltSDK } from "@boltpay/bolt-js";
import {
  getPaymentLink,
  useGetAllProducts,
  useValidateUser,
} from "../endpoints";

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

    const paymentLink = await getPaymentLink(pkg.sku);
    console.log("Payment link retrieved:", paymentLink);
    const paymentLinkSession = await BoltSDK.gaming.openCheckout(paymentLink);

    if (!paymentLinkSession) {
      console.error("Failed to open payment link session");
      return;
    } else if (paymentLinkSession.status === "abandoned") {
      console.log("Purchase cancelled by user:", pkg.name);
    } else {
      console.log("Purchase pending for:", pkg.name);
      validateUser(paymentLinkSession.paymentLinkId, {
        onSuccess: (data) => {
          toast.success(`Successfully purchased ${pkg.gemAmount} gems!`);
          console.log("User validated:", data);
        },
        onError: (error) => {
          toast.error(`Failed to validate purchase: ${error.message}`);
          console.error("Validation error:", error);
        },
      });
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
