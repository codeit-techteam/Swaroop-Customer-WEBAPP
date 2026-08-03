import type { CreditEligibility } from "@/types/purchase-request";

/**
 * Credit eligibility — mirrors SWAROOP payment method credit limits
 * (`creditLimit: 50,00,000`, `availableCredit: 37,50,000`) and
 * `CREDIT_ELIGIBILITY_APPROVED = true` demo flag.
 */
export const creditEligibilityMock: CreditEligibility = {
  approved: true,
  creditLimit: 5000000,
  availableCredit: 3750000,
  creditUsed: 1250000,
  remainingCredit: 3750000,
  eligibleFor15: true,
  eligibleFor30: true,
  interest15: 1.5,
  interest30: 2.5,
};
