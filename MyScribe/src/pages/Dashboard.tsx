import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Update the import path if your supabase client is located elsewhere, e.g.:
// Make sure this file exists and exports 'supabase'.
// If your supabase client is at 'src/integrations/supabase/client.ts', use:
import { supabase } from "@/integrations/supabase/client";
// Or update the path below to match your actual file location.
// Remove the '.ts' extension from the import path.
// Or create the file at '@/integrations/supabase/client.ts' and export supabase from there.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, LogOut } from "lucide-react";

interface Report {
  id: string;
  created_at: string;
  image_url: string;
  analysis: string | null;
  status: string;
}

const Dashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchReports();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("medical_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading reports", variant: "destructive" });
    } else {
      setReports(data || []);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("medical-reports")
        .getPublicUrl(filePath);

      const { data: report, error: insertError } = await supabase
        .from("medical_reports")
        .insert({ image_url: publicUrl, status: "pending" })
        .select()
        .single();

      if (insertError) throw insertError;

      const { error: functionError } = await supabase.functions.invoke("analyze-report", {
        body: { reportId: report.id, imageUrl: publicUrl }
      });

      if (functionError) throw functionError;

      toast({ title: "Report uploaded! Analysis in progress..." });
      fetchReports();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">MyScribe Dashboard</h1>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Medical Report</CardTitle>
            <CardDescription>
              Upload images of your blood tests, LFTs, or pathology reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="cursor-pointer">
              <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {uploading ? "Uploading..." : "Click to upload report"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, HEIC, PDF
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Your Reports</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/analysis/${report.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Report
                </CardTitle>
                <CardDescription>
                  {new Date(report.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={report.image_url}
                  alt="Medical report"
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Status: {report.status === "completed" ? "✓ Analyzed" : "⏳ Processing"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {reports.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No reports yet</p>
              <p className="text-muted-foreground">
                Upload your first medical report to get started
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
