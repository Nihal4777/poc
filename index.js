import express from "express";
import { generateKeyPair } from './helper/solana.js';
const app = express();

app.post("/get-started", async (req, res) => {


   const response =  await generateKeyPair();


    

    res.json(response);

});


app.listen(8000);