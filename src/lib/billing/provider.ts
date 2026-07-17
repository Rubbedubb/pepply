export interface CheckoutSession {
  url: string;
  providerSessionId: string;
}

export interface BillingProvider {
  createCheckout(options: {
    userId: string;
    productId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession>;
  createPortal(userId: string, returnUrl: string): Promise<{ url: string }>;
  verifyWebhook(payload: string, signature: string): Promise<unknown>;
}

export class BillingNotConfiguredError extends Error {
  constructor() {
    super("BILLING_NOT_CONFIGURED");
  }
}
