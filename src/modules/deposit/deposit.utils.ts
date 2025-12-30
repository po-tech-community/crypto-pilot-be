import * as bitcoin from "bitcoinjs-lib";
import { randomBytes } from "crypto";
import { Wallet } from "ethers";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";

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

export default function generateAddressForNetwork(network: string) {
    switch (network) {
      case "ethereum":
      case "tron":
      case "bsc":
        return generateEvmAddress().address;
      case "bitcoin":
        return generateBitcoinAddress();
      default:
        throw new Error("unsupported network");
    }
  }
  