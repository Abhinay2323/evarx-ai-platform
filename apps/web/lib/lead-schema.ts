import { z } from "zod";

export const leadSchema = z.object({
  fullName: z.string().min(2, "Please enter your name").max(120),
  workEmail: z.string().email("Enter a valid work email"),
  company: z.string().min(2, "Company name required").max(120),
  role: z.enum([
    "R&D / Discovery",
    "Clinical operations",
    "Medical affairs",
    "Regulatory",
    "Pharmacovigilance",
    "Hospital / Provider",
    "Engineering / IT",
    "Other"
  ]),
  teamSize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
  interest: z.enum([
    "Standard (Gemini Flash)",
    "Private (Evarx Medical SLM)",
    "Custom (Fine-tuned SLM)",
    "Not sure yet"
  ]),
  useCase: z.string().min(10, "Tell us a bit about the workflow").max(800),
  consent: z
    .boolean()
    .refine((v) => v === true, { message: "Required to proceed" })
});

export type LeadInput = z.infer<typeof leadSchema>;
