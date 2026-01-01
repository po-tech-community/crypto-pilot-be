import * as bitcoin from "bitcoinjs-lib";
import { randomBytes } from "crypto";
import { Wallet } from "ethers";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

function generateEvmAddress() {
    const wallet = Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    }
}

const ECPair = ECPairFactory(ecc);

function generateBitcoinAddress(): string {
  const keyPair = ECPair.fromPrivateKey(randomBytes(32));

  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: bitcoin.networks.bitcoin,
  });

  if (!address) {
    throw new Error("failed to generate bitcoin address");
  }

  return address;
}

function generateXrpAddress(): string {

  const keyPair = ECPair.fromPrivateKey(randomBytes(32));
  const publicKey = keyPair.publicKey;
  
  const hash = require("crypto").createHash("sha256").update(publicKey).digest();
  const ripemd = require("crypto").createHash("ripemd160").update(hash).digest();
  
  return "r" + bs58.encode(ripemd).slice(0, 33);
}

function generateSolanaAddress(): string {
  const keypair = Keypair.generate();
  return keypair.publicKey.toBase58();
}

export default function generateAddressForNetwork(network: string) {
    switch (network) {
      case "ethereum":
      case "bsc":
        return generateEvmAddress().address;
      case "bitcoin":
        return generateBitcoinAddress();
      case "xrp":
        return generateXrpAddress();
      case "solana":
        return generateSolanaAddress();
      default:
        throw new Error("unsupported network");
    }
}