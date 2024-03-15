import { Stripe } from "stripe";
import { headers } from "next/headers";
import * as admin from "firebase-admin";

import { buffer } from "micro";

import { NextRequest, NextResponse } from "next/server";
const serviceAccount = require("../../../permissions.json");

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  : admin.app();

// Establish connection to Stripe

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

const fulfillOrder = async (session: any) => {
  console.log(session);
  return app
    .firestore()
    .collection("users")
    .doc(session.metadata.email)
    .collection("orders")
    .doc(session.id)
    .set({
      amount: session.amount_total / 100,
      amount_shipping: session.total_details.amount_shipping / 100,
      images: JSON.parse(session.metadata.images),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      // console.log()
      console.log(
        `Success: ORder ${session.id} has been added to the DATABASE`
      );
    });
};

export async function POST(request: any, response: any) {
  const signature = headers().get("Stripe-Signature") ?? "";
  const body = await request.text();
  const key = process.env.KEY!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      "whsec_00eff49e647740b929bca4751d8712ad08d6285bf6f123b24c48e0fd6c2cca66"
    );
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await fulfillOrder(session);
    console.log(session);

    return NextResponse.json({
      status: 201,
      message: "This Worked",
      success: true,
    });
  }

  return new NextResponse(null, { status: 200 });
}
