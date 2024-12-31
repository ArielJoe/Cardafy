import { decrypt, encrypt } from "./crypt";

interface Wallet {
  name: string;
  icon: string;
}

export function setWallet(wallet: Wallet) {
  localStorage.setItem("selectedWallet", JSON.stringify(wallet));
}

export function getWallet() {
  return localStorage.getItem("selectedWallet");
}

export function setHasGold() {
  localStorage.setItem(
    "hasGold",
    encrypt(
      process.env.NEXT_PUBLIC_TOKEN_GOLD_SECRET!,
      process.env.NEXT_PUBLIC_TOKEN_GOLD_SECRET_KEY!
    )
  );
}

export function setHasPlatinum() {
  localStorage.setItem(
    "hasPlatinum",
    encrypt(
      process.env.NEXT_PUBLIC_TOKEN_PLATINUM_SECRET!,
      process.env.NEXT_PUBLIC_TOKEN_PLATINUM_SECRET_KEY!
    )
  );
}

export function setHasSilver() {
  localStorage.setItem(
    "hasSilver",
    encrypt(
      process.env.NEXT_PUBLIC_TOKEN_SILVER_SECRET!,
      process.env.NEXT_PUBLIC_TOKEN_SILVER_SECRET_KEY!
    )
  );
}

export function getHasGold() {
  return (
    decrypt(
      localStorage.getItem("hasGold")!,
      process.env.NEXT_PUBLIC_TOKEN_GOLD_SECRET_KEY!
    ) === process.env.NEXT_PUBLIC_TOKEN_GOLD_SECRET
  );
}

export function getHasPlatinum() {
  return (
    decrypt(
      localStorage.getItem("hasPlatinum")!,
      process.env.NEXT_PUBLIC_TOKEN_PLATINUM_SECRET_KEY!
    ) === process.env.NEXT_PUBLIC_TOKEN_PLATINUM_SECRET
  );
}

export function getHasSilver() {
  return (
    decrypt(
      localStorage.getItem("hasSilver")!,
      process.env.NEXT_PUBLIC_TOKEN_SILVER_SECRET_KEY!
    ) === process.env.NEXT_PUBLIC_TOKEN_SILVER_SECRET
  );
}

export function removeHasGold() {
  localStorage.removeItem("hasGold");
}

export function removeHasPlatinum() {
  localStorage.removeItem("hasPlatinum");
}

export function removeHasSilver() {
  localStorage.removeItem("hasSilver");
}

export function logout() {
  localStorage.removeItem("selectedWallet");
  localStorage.removeItem("hasGold");
  localStorage.removeItem("hasPlatinum");
  localStorage.removeItem("hasSilver");
}
