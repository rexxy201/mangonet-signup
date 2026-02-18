import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";

export interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nin: string;
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  plan: string;
  wifiSsid: string;
  wifiPassword: string;
  installationDate: string;
  notes: string | null;
  passportPhoto: string | null;
  govtId: string | null;
  proofOfAddress: string | null;
  status: "pending" | "paid" | "approved" | "rejected";
  paymentRef: string | null;
  submittedAt: string;
}

export function useSubmissions() {
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await apiRequest("POST", "/api/submissions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/submissions/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, paymentRef }: { id: string; paymentRef: string }) => {
      const res = await apiRequest("PATCH", `/api/submissions/${id}/payment`, { paymentRef });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
  });

  const addSubmission = (data: Record<string, any>) => {
    return addMutation.mutateAsync(data);
  };

  const updatePayment = (id: string, paymentRef: string) => {
    return paymentMutation.mutateAsync({ id, paymentRef });
  };

  const updateStatus = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  return { submissions, addSubmission, updatePayment, updateStatus, isLoading };
}

export function useAdminAuth() {
  const AUTH_KEY = "mangonet_admin_auth";
  const ROLE_KEY = "mangonet_admin_role";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "standard">("admin");

  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY);
    const storedRole = sessionStorage.getItem(ROLE_KEY) as "admin" | "standard" | null;
    setIsAuthenticated(auth === "true");
    setRole(storedRole || "admin");
    setIsLoading(false);
  }, []);

  const login = async (password: string, username?: string) => {
    try {
      const body: any = { password };
      if (username) body.username = username;
      const res = await apiRequest("POST", "/api/admin/login", body);
      const data = await res.json();
      if (data.success) {
        const userRole = data.role === "standard" ? "standard" : "admin";
        sessionStorage.setItem(AUTH_KEY, "true");
        sessionStorage.setItem(ROLE_KEY, userRole);
        setIsAuthenticated(true);
        setRole(userRole);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    setIsAuthenticated(false);
    setRole("admin");
  };

  const isAdmin = role === "admin";

  return { isAuthenticated, isLoading, login, logout, role, isAdmin };
}

export function useLogo() {
  const queryClient = useQueryClient();

  const { data } = useQuery<{ value: string }>({
    queryKey: ["/api/settings/logo"],
  });

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      await apiRequest("PUT", "/api/settings/logo", { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/logo"] });
    },
  });

  const saveLogo = (dataUrl: string) => {
    saveMutation.mutate(dataUrl);
  };

  const removeLogo = () => {
    saveMutation.mutate("");
  };

  return { logo: data?.value || "", saveLogo, removeLogo };
}

export function useFavicon() {
  const queryClient = useQueryClient();

  const { data } = useQuery<{ value: string }>({
    queryKey: ["/api/settings/favicon"],
  });

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      await apiRequest("PUT", "/api/settings/favicon", { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/favicon"] });
    },
  });

  const saveFavicon = (dataUrl: string) => {
    saveMutation.mutate(dataUrl);
  };

  const removeFavicon = () => {
    saveMutation.mutate("");
  };

  return { favicon: data?.value || "", saveFavicon, removeFavicon };
}

export function useSeoImage() {
  const queryClient = useQueryClient();

  const { data } = useQuery<{ value: string }>({
    queryKey: ["/api/settings/seo_image"],
  });

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      await apiRequest("PUT", "/api/settings/seo_image", { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/seo_image"] });
    },
  });

  const saveSeoImage = (dataUrl: string) => {
    saveMutation.mutate(dataUrl);
  };

  const removeSeoImage = () => {
    saveMutation.mutate("");
  };

  return { seoImage: data?.value || "", saveSeoImage, removeSeoImage };
}

export function useSignupNote() {
  const queryClient = useQueryClient();
  const { data } = useQuery<{ value: string }>({
    queryKey: ["/api/settings/signup_note"],
  });

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      await apiRequest("PUT", "/api/settings/signup_note", { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/signup_note"] });
    },
  });

  const saveNote = (newNote: string) => {
    saveMutation.mutate(newNote);
  };

  const defaultNote = "The installation fee includes one month of free subscription up to the Premium Plan.\n\nIf you select a plan higher than the Premium Plan, you will be required to pay the difference to upgrade.";

  return { note: data?.value !== undefined ? data.value : defaultNote, saveNote };
}

export function useInstallationCost() {
  const queryClient = useQueryClient();
  const { data } = useQuery<{ value: string }>({
    queryKey: ["/api/settings/installation_cost"],
  });

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      await apiRequest("PUT", "/api/settings/installation_cost", { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/installation_cost"] });
    },
  });

  const saveCost = (newCost: string) => {
    saveMutation.mutate(newCost);
  };

  const cost = data?.value ? parseInt(data.value) : 100000;

  return { cost, rawValue: data?.value || "100000", saveCost };
}

export function usePaystackKey() {
  const { data } = useQuery<{ value: string }>({
    queryKey: ["/api/settings/paystack_key"],
  });

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      await apiRequest("PUT", "/api/settings/paystack_key", { value });
    },
  });

  const saveKey = (newKey: string) => {
    saveMutation.mutate(newKey);
  };

  return { key: data?.value || "", saveKey };
}

export function usePaystackSecretKey() {
  const { data } = useQuery<{ value: string }>({
    queryKey: ["/api/settings/paystack_secret_key"],
  });

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      await apiRequest("PUT", "/api/settings/paystack_secret_key", { value });
    },
  });

  const saveKey = (newKey: string) => {
    saveMutation.mutate(newKey);
  };

  return { key: data?.value || "", saveKey };
}
