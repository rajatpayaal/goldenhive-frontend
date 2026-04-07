import CartClient from "./CartClient";
import { PackageSuggestionsSection } from "@/components/PackageSuggestionsSection";
import { getCartAction } from "@/actions/cart.actions";

export default async function CartPage() {
  let excludeId = "";
  try {
    const response = await getCartAction();
    const items = response?.ok ? response?.data?.data?.packageId || [] : [];
    excludeId = items?.[0]?._id || "";
  } catch {
    excludeId = "";
  }

  return (
    <>
      <CartClient />
      <div className="mx-auto max-w-6xl px-5 pb-14">
        <PackageSuggestionsSection
          excludeId={excludeId}
          title="Recommended for you"
          subtitle="Popular packages you can add to your cart"
          limit={6}
        />
      </div>
    </>
  );
}
