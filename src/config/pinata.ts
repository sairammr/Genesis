// utils/pinata-config.ts
import { PinataSDK } from "pinata-web3";

export const PINATA_GATEWAY = import.meta.env.VITE_PUBLIC_PINATA_GATEWAY;
export const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PUBLIC_PINATA_JWT!,
  pinataGateway: PINATA_GATEWAY,
});
