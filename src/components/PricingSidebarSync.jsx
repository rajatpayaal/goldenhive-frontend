"use client";

import React, { useEffect, useState } from "react";
import { PackageBookingSidebar } from "./PackageBookingSidebar";

export function PricingSidebarSync({
  packageId,
  packageName,
  packageData,
  bestDeal,
  pricing,
  whatsapp,
  callNumber,
  cancellationPolicy,
  refundPolicy,
  availability,
  pricingOptions,
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    // Listen for pricing option selection events
    const handlePricingSelect = (event) => {
      const option = event.detail;
      setSelectedOption(option);
    };

    window.addEventListener("pricing-option-selected", handlePricingSelect);
    return () => window.removeEventListener("pricing-option-selected", handlePricingSelect);
  }, []);

  return (
    <PackageBookingSidebar
      packageId={packageId}
      packageName={packageName}
      packageData={packageData}
      bestDeal={bestDeal}
      pricing={pricing}
      whatsapp={whatsapp}
      callNumber={callNumber}
      cancellationPolicy={cancellationPolicy}
      refundPolicy={refundPolicy}
      availability={availability}
      pricingOptions={pricingOptions}
      selectedOption={selectedOption}
      onOptionSelect={setSelectedOption}
    />
  );
}
