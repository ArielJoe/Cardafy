export function getToken() {
  const gold = process.env.NEXT_PUBLIC_TOKEN_GOLD;
  const silver = process.env.NEXT_PUBLIC_TOKEN_SILVER;
  const platinum = process.env.NEXT_PUBLIC_TOKEN_PLATINUM;
  const policyID = process.env.NEXT_PUBLIC_POLICY_ID;

  return { gold, silver, platinum, policyID };
}
