
import { exportLeadToSheet, fetchSpreadsheets, createNewSpreadsheet } from "@/services/googleapi.service";
import { Lead } from "@/types/lead";
import { useGoogleLogin } from "@react-oauth/google";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const googleApiKeys = {
  all: ["googleApi"] as const,
  spreadLists: () => [...googleApiKeys.all, "spreadList"] as const,
};

const TWO_MINUTES = 2 * 60 * 1000;

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const requiredScopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
    "openid",
    "profile",
    "email",
  ];

  const handleLogin = useGoogleLogin({
    flow: "implicit",
    scope: requiredScopes.join(" "),
    prompt: "select_account",
    onSuccess: (tokenResponse) => {
      setIsLoading(false);
      setError(null);
      // Check granted scopes
      const grantedScopes = (tokenResponse.scope || "").split(" ");
      const missingScopes = requiredScopes.filter(scope => !grantedScopes.includes(scope));
      if (missingScopes.length > 0) {
        setError("Missing required Google permissions: " + missingScopes.join(", "));
        toast.error("Missing required Google permissions: " + missingScopes.join(", "));
        return;
      }
      setToken(tokenResponse.access_token);
    },
    onError: (error) => {
      setIsLoading(false);
      setError("Failed to connect with Google");
      toast.error("Failed to connect with Google");
      console.error("Login Failed:", error);
    },
    onNonOAuthError: () => {
      setIsLoading(false);
    },
  });

  const login = useCallback(() => {
    setIsLoading(true);
    handleLogin();
  }, [handleLogin]);

  return {
    login,
    token,
    isLoading,
    isConnected: !!token,
    error,
  };
}

export function useGoogleSpreadsheetQuery(accessToken: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [googleApiKeys.spreadLists(), accessToken],
    queryFn: () => fetchSpreadsheets(accessToken),
    enabled: !!accessToken && enabled,
    staleTime: TWO_MINUTES,
  });
}

export function useGoogleExport(accessToken: string) {
  const mutation = useMutation({
    mutationFn: async ({ lead, selectedSheet }: { lead: Lead; selectedSheet: string }) => {
      if (!accessToken) throw new Error("No access token provided");
      if (!lead) throw new Error("No lead data to export");
      if (!selectedSheet) throw new Error("Please select a spreadsheet");
      await exportLeadToSheet(accessToken, selectedSheet, lead);
    },
    onSuccess: () => {
      toast.success("Data exported successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Export failed");
    },
  });

  return mutation
}

export function useGoogleCreateAndExport(accessToken: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ lead, spreadsheetName }: { lead: Lead; spreadsheetName: string }) => {
      if (!accessToken) throw new Error("No access token provided");
      if (!lead) throw new Error("No lead data to export");
      if (!spreadsheetName || spreadsheetName.trim() === "") throw new Error("Please enter a spreadsheet name");
      // Create new spreadsheet and export lead
      const newSheet = await createNewSpreadsheet(accessToken, spreadsheetName);
      await exportLeadToSheet(accessToken, newSheet.id, lead);
      return newSheet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [googleApiKeys.spreadLists(), accessToken] });
      toast.success("Spreadsheet created and lead exported!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Create & export failed");
    },
  });

  return mutation;
}
