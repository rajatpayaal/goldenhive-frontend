"use client";

import React, { useState } from "react";
import { PricingOptionsSelector } from "./PricingOptionsSelector";
import { PackageBookingSidebar } from "./PackageBookingSidebar";

export function PackageDetailsClient({
  packageId,
  packageName,
  packageData,
  pricingOptions,
  bestDeal,
  pricing,
  whatsapp,
  callNumber,
  cancellationPolicy,
  refundPolicy,
  availability,
  mainContent, // The main content sections (Overview, Highlights, etc.)
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        {mainContent}

        {/* Pricing Options Section */}
        {pricingOptions && pricingOptions.length > 0 && (
          <PricingOptionsSelector
            packageId={packageId}
            packageName={packageName}
            pricingOptions={pricingOptions}
            selectedOption={selectedOption}
            onOptionSelect={setSelectedOption}
          />
        )}
      </div>

      {/* Sidebar that syncs with selected option */}
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
    </div>
  );
}
