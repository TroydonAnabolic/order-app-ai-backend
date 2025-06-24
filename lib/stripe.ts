import Stripe from "stripe";
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   apiVersion: "2025-05-28.basil",
//   typescript: true,
// });

// import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  httpClient: Stripe.createFetchHttpClient(),
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2025-05-28.basil",
  typescript: true,
  appInfo: {
    name: "Order App",
  },
});
