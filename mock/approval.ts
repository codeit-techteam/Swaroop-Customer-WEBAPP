export const REJECTION_REASONS = [
  {
    id: "inventory",
    reason:
      "Insufficient inventory at selected warehouse for the requested quantity.",
    suggestedAction:
      "Reduce quantity to available stock or choose an alternate warehouse, then resubmit.",
  },
  {
    id: "pricing",
    reason:
      "Market price moved outside the locked window before PetroTrade confirmation.",
    suggestedAction:
      "Create a new purchase request to lock the current market price.",
  },
  {
    id: "credit",
    reason: "Credit limit insufficient for the selected credit payment terms.",
    suggestedAction:
      "Switch to Advance or On Loading payment, or reduce order value.",
  },
  {
    id: "moq",
    reason: "Requested quantity does not meet MOQ for this grade.",
    suggestedAction: "Increase quantity to meet MOQ and resubmit the request.",
  },
] as const;

export const DEFAULT_REJECTION = REJECTION_REASONS[0];

export const REJECTION_COPY = {
  title: "Request Declined",
  subtitle: "PetroTrade could not confirm this purchase request.",
  modifyLabel: "Modify Request",
  browseLabel: "Browse Products",
} as const;
