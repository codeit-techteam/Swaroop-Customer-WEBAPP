export interface CheckoutMock {
  steps: never[];
  paymentOptions: never[];
}

export const checkoutMock: CheckoutMock = {
  steps: [],
  paymentOptions: [],
};
