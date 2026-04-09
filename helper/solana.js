import { createSignerFromKeyPair, generateKeyPairSigner } from '@solana/kit';
import bs58 from "bs58"
import crypto from "crypto"
export const generateKeyPair = async () => {

   


}

export const generateAESKey = () => {
    return crypto.randomBytes(16).toString("base64");
}