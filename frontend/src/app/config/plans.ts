export const PLANS = {
    basic: { name: "Basic", price: 10 },
    pro: { name: "Pro", price: 20 },
  } as const;
  
  export type PlanType = keyof typeof PLANS;