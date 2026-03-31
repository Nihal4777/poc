import { createSignerFromKeyPair, generateKeyPairSigner } from '@solana/kit';
import bs58 from "bs58"

export const generateKeyPair = async () => {

    const cryptoKeyPair = await crypto.subtle.generateKey(
        { name: "Ed25519" },
        true,               // <— extractable!
        ["sign", "verify"]
    );
    const exported = await crypto.subtle.exportKey("pkcs8", cryptoKeyPair.privateKey);
    
    // Last 32 bytes of pkcs8 export are the private key
    const bytes = new Uint8Array(
        exported,
        exported.byteLength - 32,
        32
    );
    const privateKeyBase58 = bs58.encode(bytes);
    const exportedPublicKey = await crypto.subtle.exportKey("raw", cryptoKeyPair.publicKey);
    const publicKeyBytes = new Uint8Array(exportedPublicKey);
    const publicKeyBase58 = bs58.encode(publicKeyBytes);

    return {
        publicKeyBase58,
        privateKeyBase58
    }


}