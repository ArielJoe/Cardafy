"use client";

import ItemDetail from "@/components/dashboard/ItemDetail";
import MembershipVerification from "@/components/validator/MembershipVerification";
import NoAccess from "@/components/state/NoAccess";
import { useState } from "react";

const membership = "platinum";

export default function PlatinumItem() {
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
