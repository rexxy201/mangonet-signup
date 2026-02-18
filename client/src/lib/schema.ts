import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  nin: z.string().length(11, "NIN must be exactly 11 digits").regex(/^\d+$/, "NIN must contain only numbers"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().optional(),
  plan: z.string({
    required_error: "Please select a plan",
  }),
  wifiSsid: z.string().min(2, "Wifi Name (SSID) is required"),
  wifiPassword: z.string().min(8, "Wifi Password must be at least 8 characters"),
  passportPhoto: z.any().optional(),
  govtId: z.any().optional(),
  proofOfAddress: z.any().optional(),
  installationDate: z.date({
    required_error: "Please select a preferred installation date",
  }),
  notes: z.string().optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export interface Submission extends SignupFormData {
  id: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}
