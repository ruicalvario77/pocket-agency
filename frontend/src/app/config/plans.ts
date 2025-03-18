export const PLANS = {
    basic: { name: "Basic", price: 3000 },
    pro: { name: "Pro", price: 8000 },
  } as const;
  
  export type PlanType = keyof typeof PLANS;