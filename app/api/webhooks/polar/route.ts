import { Webhooks } from "@polar-sh/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  // For one-time purchases, we use onOrderPaid
  onOrderPaid: async (payload) => {
    const customerId = payload.data.customerId;
    const customerEmail = payload.data.customer?.email;
    const orderId = payload.data.id;

    if (customerEmail) {
      await convex.mutation(api.subscriptions.handleOrderPaid, {
        polarCustomerId: customerId,
        email: customerEmail,
        polarOrderId: orderId,
      });
    }
  },
});
