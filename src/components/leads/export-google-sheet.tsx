
import { useGoogleSpreadsheetQuery } from "@/hooks/use-google-api";
import { Loader2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ExportGoogleSheetButtonProps {
  readonly accessToken: string;
  mode: "select" | "create";
  setSpreadsheetName: (name: string) => void;
  setSpreadsheetId: (id: string) => void;
  isExporting?: boolean;
  setMode: (mode: "select" | "create") => void;
}

export default function ExportGoogleSheetButton({ isExporting, accessToken, mode, setMode, setSpreadsheetId, setSpreadsheetName }: Readonly<ExportGoogleSheetButtonProps>) {
  const { data: spreadsheets, isLoading: isLoadingSpreadsheets, isPending: isPendingSpreadsheets } = useGoogleSpreadsheetQuery(accessToken, !!accessToken);

  if (!accessToken) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-xl bg-white">
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "select" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("select")}
            disabled={isExporting}
            type="button"
          >
            Select Existing
          </Button>
          <Button
            variant={mode === "create" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("create")}
            disabled={isExporting}
            type="button"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create New
          </Button>
        </div>

        {mode === "select" && (
          <div className="space-y-2">
            <Label>Select Spreadsheet</Label>
            {(isLoadingSpreadsheets || isPendingSpreadsheets) ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Loading spreadsheets...</span>
              </div>
            ) : (
              <Select
                disabled={isLoadingSpreadsheets}
                onValueChange={(value) => {
                  setSpreadsheetId(value);
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a spreadsheet" />
                </SelectTrigger>
                <SelectContent>
                  <div className="max-h-[200px] overflow-y-auto">
                    {spreadsheets?.map((sheet) => (
                      <SelectItem key={sheet.id} value={sheet.id}>
                        {sheet.name.length > 45 ? sheet.name.slice(0, 45) + "..." : sheet.name}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-2 mb-2">
            <Label>Spreadsheet Name</Label>
            <Input
              placeholder="Enter spreadsheet name"
              onChange={(e) => setSpreadsheetName((e.target as HTMLInputElement).value)}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
}
