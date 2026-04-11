import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import express from "express";
import crypto from "crypto";
import { storeUser, getUserById, updateUser, updateOptionsForUser, updateCounterForUser } from "./helper/storage.js";
import cors from "cors";
import { generateAESKey } from "./helper/solana.js"
import { configDotenv } from "dotenv";
const app = express();

configDotenv();
const rpId = process.env.RP_ID

// app.use()\\/
app.use(cors())
app.use(express.json());

app.post("/get-started", async (req, res) => {

    const userID = crypto.randomBytes(16);
    const userName = "Account - 1";
    console.log(userID.toString('base64url'))
    const options = await generateRegistrationOptions({
        rpName: "localhost",
        rpID: rpId,
        userID,
        userName: "Account - 1"
    });

    await storeUser({
        _id: userID,
        userName,
        options
    });
    res.json(options);
    //save this info

});


app.post("/complete-registration", async (req, res) => {
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");

    const user = await getUserById(req.body.id)

    const verificationJSON = await verifyRegistrationResponse({
        response: req.body.attestationResponse,
        expectedChallenge: user.options.challenge,
        expectedOrigin: req.headers.origin,
        expectedRPID: rpId,
    })

    if (!verificationJSON.verified) {
        res.json({
            success: false
        });
    }

    const key = generateAESKey()

    console.log(verificationJSON);

    const { registrationInfo } = verificationJSON;

    const {
        credential,
        credentialDeviceType,
        credentialBackedUp,
    } = registrationInfo;



    const newPasskey = {
        //     // `user` here is from Step 2
        //     user,
        //     // Created by `generateRegistrationOptions()` in Step 1
        webAuthnUserID: user.options.user.id,
        //     // A unique identifier for the credential
        id: credential.id,
        //     // The public key bytes, used for subsequent authentication signature verification
        publicKey: credential.publicKey,
        //     // The number of times the authenticator has been used on this site so far
        counter: credential.counter,
        //     // How the browser can talk with this credential's authenticator
        transports: credential.transports,
        //     // Whether the passkey is single-device or multi-device
        deviceType: credentialDeviceType,
        //     // Whether the passkey has been backed up in some way
        backedUp: credentialBackedUp,
    };

    // // (Pseudocode) Save the authenticator info so that we can
    // // get it by user ID later
    // saveNewPasskeyInDB(newPasskey);



    console.log(await updateUser(user._id, key, verificationJSON, newPasskey))

    res.json({
        success: true,
        key,
        id: user._id
    });

});




app.post("/authenticate/options", async (req, res) => {

    const user = await getUserById(req.body.id)

    console.log(user);
    const options = await generateAuthenticationOptions({
        rpName: "localhost",
        rpID: rpId,
        allowCredentials: [user.passKey].map(passkey => ({
            id: passkey.id,
            transports: passkey.transports,
        })),
    });
    await updateOptionsForUser(user._id, options)


    res.json(options);
    //save this info

});


app.post("/authenticate/verify", async (req, res) => {

    const user = await getUserById(req.body.id)
    const currentOptions = user.options;
    const passkey = user.passKey;
    const verification = await verifyAuthenticationResponse({
        response: req.body.credential,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: req.headers.origin,
        expectedRPID: rpId,
        credential: {
            id: passkey.id,
            publicKey: new Uint8Array(passkey.publicKey.buffer),
            counter: passkey.counter,
            transports: passkey.transports,
        },
    });
    const { authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;

    await updateCounterForUser(user._id, newCounter)


    res.json({
        verification,
        key:user.key
    });
    //save this info
});


app.listen(8000, "0.0.0.0");