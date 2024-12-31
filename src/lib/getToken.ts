interface Token {
  gold: string | undefined;
  silver: string | undefined;
  platinum: string | undefined;
  policyID: string | undefined;
}

export function getToken(): Token {
  return {
    gold: process.env.NEXT_PUBLIC_TOKEN_GOLD,
    silver: process.env.NEXT_PUBLIC_TOKEN_SILVER,
    platinum: process.env.NEXT_PUBLIC_TOKEN_PLATINUM,
    policyID: process.env.NEXT_PUBLIC_POLICY_ID,
  };
}
