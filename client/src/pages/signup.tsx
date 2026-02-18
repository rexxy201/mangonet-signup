import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Header } from "@/components/header";
import { signupSchema, SignupFormData } from "@/lib/schema";
import { useSubmissions, usePaystackKey, useInstallationCost, useSignupNote, type Submission } from "@/lib/storage";
import { useState } from "react";

const residentialPlans = [
  { id: "basic", name: "Mango Basic", price: "NGN 14,067", speed: "25Mbps", category: "Residential" },
  { id: "plus", name: "Mango Plus", price: "NGN 19,929", speed: "40Mbps", category: "Residential" },
  { id: "premium", name: "Mango Premium", price: "NGN 25,790", speed: "60Mbps", category: "Residential" },
  { id: "premium_plus", name: "Mango Premium+", price: "NGN 35,172", speed: "80Mbps", category: "Residential" },
  { id: "gold", name: "Mango Gold", price: "NGN 40,447", speed: "120Mbps", category: "Residential" },
  { id: "diamond", name: "Mango Diamond", price: "NGN 48,362.00", speed: "165Mbps", category: "Residential" },
  { id: "platinum", name: "Mango Platinum", price: "NGN 58,245.00", speed: "200Mbps", category: "Residential" },
];

const corporatePlans = [
  { id: "sme", name: "Mango SME", price: "NGN 29,306", speed: "65Mbps", category: "Corporate" },
  { id: "corp_plus", name: "Mango Corporate Plus", price: "NGN 52,751", speed: "100Mbps", category: "Corporate" },
  { id: "corp_premium", name: "Mango Corporate Premium", price: "NGN 58,613", speed: "140Mbps", category: "Corporate" },
  { id: "preferred", name: "Mango Preferred", price: "NGN 67,404", speed: "200Mbps", category: "Corporate" },
  { id: "advantage", name: "Mango Advantage", price: "NGN 89,648", speed: "250Mbps", category: "Corporate" },
  { id: "ultimate", name: "Mango Ultimate", price: "NGN 107,578", speed: "350Mbps", category: "Corporate" },
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

export default function Signup() {
  const [, setLocation] = useLocation();
  const { addSubmission, updatePayment } = useSubmissions();
  const { key: paystackKey } = usePaystackKey();
  const { cost: installationCost } = useInstallationCost();
  const { note: signupNote } = useSignupNote();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planCategory, setPlanCategory] = useState<"Residential" | "Corporate">("Residential");

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nin: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      plan: "basic",
      wifiSsid: "",
      wifiPassword: "",
      notes: "",
    },
  });

  const currentPlans = planCategory === "Residential" ? residentialPlans : corporatePlans;

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onSubmit(data: SignupFormData) {
    setIsSubmitting(true);

    let passportPhotoB64: string | null = null;
    let govtIdB64: string | null = null;
    let proofOfAddressB64: string | null = null;

    try {
      if (data.passportPhoto instanceof File) {
        passportPhotoB64 = await fileToBase64(data.passportPhoto);
      }
      if (data.govtId instanceof File) {
        govtIdB64 = await fileToBase64(data.govtId);
      }
      if (data.proofOfAddress instanceof File) {
        proofOfAddressB64 = await fileToBase64(data.proofOfAddress);
      }
    } catch {
      // Files are optional, continue without them
    }

    let submission: any;
    try {
      submission = await addSubmission({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nin: data.nin,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode || null,
        plan: data.plan,
        wifiSsid: data.wifiSsid,
        wifiPassword: data.wifiPassword,
        installationDate: data.installationDate.toISOString(),
        notes: data.notes || null,
        passportPhoto: passportPhotoB64,
        govtId: govtIdB64,
        proofOfAddress: proofOfAddressB64,
        status: "pending",
        paymentRef: null,
      });
    } catch (err) {
      console.error("Failed to save submission:", err);
      alert("There was an error saving your application. Please try again.");
      setIsSubmitting(false);
      return;
    }

    if (!(window as any).PaystackPop) {
      alert("Payment system is loading. Please try again in a moment.");
      setIsSubmitting(false);
      return;
    }

    try {
      const selectedPlan = [...residentialPlans, ...corporatePlans].find(p => p.id === data.plan);
      const amount = installationCost * 100;

      const paystack = new (window as any).PaystackPop();
      paystack.newTransaction({
        key: paystackKey || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        email: data.email,
        amount: amount,
        currency: 'NGN',
        ref: '' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
          custom_fields: [
            {
              display_name: "Mobile Number",
              variable_name: "mobile_number",
              value: data.phone
            },
            {
              display_name: "Plan",
              variable_name: "plan",
              value: selectedPlan?.name
            }
          ]
        },
        onSuccess: async function(response: any) {
          try {
            await updatePayment(submission.id, response.reference);
            setLocation("/success");
          } catch (err) {
            console.error("Failed to update payment:", err);
            alert("Payment succeeded but there was an error updating your application. Please contact support with ref: " + response.reference);
          }
          setIsSubmitting(false);
        },
        onCancel: function() {
          alert('Payment was not completed. Your application has been saved and you can complete payment later.');
          setIsSubmitting(false);
        }
      });
    } catch (err) {
      console.error("Failed to initialize payment:", err);
      alert("Your application has been saved but there was an error opening the payment window. Please contact support.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Get Connected Today</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Fill out the form below to check availability and schedule your MangoNet installation.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_350px]">
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Details</CardTitle>
                      <CardDescription>We need your contact information to set up your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl><Input placeholder="John" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="nin" render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIN (National Identification Number)</FormLabel>
                          <FormControl><Input type="text" placeholder="12345678901" maxLength={11} {...field} data-testid="input-nin" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Service Location</CardTitle>
                      <CardDescription>Where should we install your service?</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-6 md:grid-cols-2">
                         <div className="space-y-2">
                           <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Country</label>
                           <Input value="Nigeria" disabled className="bg-gray-100" />
                         </div>
                         <FormField control={form.control} name="state" render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                              <SelectContent className="max-h-[200px]">
                                {nigerianStates.map((state) => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl><Input placeholder="123 Mango Lane" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField control={form.control} name="city" render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input placeholder="Lagos" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="zipCode" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code (Optional)</FormLabel>
                            <FormControl><Input placeholder="100001" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Wifi Configuration</CardTitle>
                      <CardDescription>Set up your wireless network details.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <FormField control={form.control} name="wifiSsid" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose SSID (Wifi Name) *</FormLabel>
                          <FormControl><Input placeholder="Enter Wifi name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="wifiPassword" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wifi Password *</FormLabel>
                          <FormControl><Input type="text" placeholder="Enter Wifi Password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Required Documents</CardTitle>
                      <CardDescription>Upload necessary documents for processing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField control={form.control} name="passportPhoto" render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Passport Photograph *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${value ? 'bg-green-50 border-green-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-300'}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                  {value ? (
                                    <>
                                      <Check className="h-8 w-8 text-green-500 mb-2" />
                                      <p className="text-sm font-medium text-green-700 truncate max-w-full">{(value as File).name}</p>
                                      <p className="text-xs text-green-600 mt-1">Click to change</p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                      <p className="text-xs text-gray-500">JPG or PNG</p>
                                    </>
                                  )}
                                </div>
                                <Input 
                                  {...fieldProps} 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={(e) => onChange(e.target.files?.[0])} 
                                />
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="govtId" render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Government Identification *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${value ? 'bg-green-50 border-green-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-300'}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                  {value ? (
                                    <>
                                      <Check className="h-8 w-8 text-green-500 mb-2" />
                                      <p className="text-sm font-medium text-green-700 truncate max-w-full">{(value as File).name}</p>
                                      <p className="text-xs text-green-600 mt-1">Click to change</p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                      <p className="text-xs text-gray-500">PDF, JPG or PNG</p>
                                    </>
                                  )}
                                </div>
                                <Input 
                                  {...fieldProps} 
                                  type="file" 
                                  className="hidden" 
                                  accept=".pdf,image/*" 
                                  onChange={(e) => onChange(e.target.files?.[0])} 
                                />
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="proofOfAddress" render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Proof of Address *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${value ? 'bg-green-50 border-green-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-300'}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                  {value ? (
                                    <>
                                      <Check className="h-8 w-8 text-green-500 mb-2" />
                                      <p className="text-sm font-medium text-green-700 truncate max-w-full">{(value as File).name}</p>
                                      <p className="text-xs text-green-600 mt-1">Click to change</p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                      <p className="text-xs text-gray-500">Utility bill, etc.</p>
                                    </>
                                  )}
                                </div>
                                <Input 
                                  {...fieldProps} 
                                  type="file" 
                                  className="hidden" 
                                  accept=".pdf,image/*" 
                                  onChange={(e) => onChange(e.target.files?.[0])} 
                                />
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Installation</CardTitle>
                      <CardDescription>When would you like us to come by?</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <FormField control={form.control} name="installationDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Preferred Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Installation Notes (Optional)</FormLabel>
                          <FormControl><Textarea placeholder="Gate code, etc." className="resize-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div className="lg:sticky lg:top-24">
                    <Card className="border-primary/20 shadow-md overflow-hidden">
                      <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-lg">Select Your Plan</CardTitle>
                        <div className="flex gap-2 mt-4">
                          <Button type="button" variant={planCategory === 'Residential' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setPlanCategory('Residential')}>Residential</Button>
                          <Button type="button" variant={planCategory === 'Corporate' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setPlanCategory('Corporate')}>Corporate</Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <FormField control={form.control} name="plan" render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-3">
                                {currentPlans.map((plan) => (
                                  <FormItem key={plan.id}>
                                    <FormControl><RadioGroupItem value={plan.id} className="peer sr-only" /></FormControl>
                                    <FormLabel className="flex cursor-pointer flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-foreground">{plan.name}</span>
                                        <span className="font-bold text-primary">{plan.price}/mo</span>
                                      </div>
                                      <div className="text-sm font-medium text-gray-700">Up to {plan.speed}</div>
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>
                    <Button type="submit" className="w-full mt-6 text-lg h-12 shadow-lg shadow-primary/20" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Signup"}
                    </Button>
                    {signupNote && (
                      <p className="mt-3 text-xs text-gray-500 text-center leading-relaxed whitespace-pre-line">{signupNote}</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
