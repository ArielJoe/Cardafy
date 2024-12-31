"use client";

import ItemDetail from "@/components/ItemDetail";
import MembershipVerification from "@/components/validator/MembershipVerification";
import NoAccess from "@/components/state/NoAccess";
import { useState } from "react";

const membership = "silver";

export default function SilverItem() {
  const [hasMembership, setHasMembership] = useState(false);

  return (
    <MembershipVerification
      membershipType={membership}
      onVerificationComplete={setHasMembership}
    >
      {hasMembership ? (
        <ItemDetail membershipType={membership} />
      ) : (
        <NoAccess />
      )}
    </MembershipVerification>
  );
}
