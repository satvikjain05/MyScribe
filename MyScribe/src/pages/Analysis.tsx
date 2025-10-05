import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface Report {
  id: string;
  created_at: string;
  image_url: string;
  analysis: string | null;
  status: string;
}

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();

    const channel = supabase
      .channel(`report-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "medical_reports",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setReport(payload.new as Report);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchReport = async () => {
    let data: any = null;
    let error: any = null;
    if (id) {
      const res = await supabase
        .from("medical_reports")
        .select("*")
        .eq("id", id)
        .single();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error("Error fetching report:", error);
    } else {
      setReport(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Report not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Medical Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Uploaded on {new Date(report.created_at).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <img
              src={report.image_url}
              alt="Medical report"
              className="w-full rounded-lg shadow-lg"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {report.status === "pending" && (
              <div className="text-center py-8">
                <div className="animate-pulse mb-4">Analyzing your report...</div>
                <p className="text-sm text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            )}

            {report.status === "completed" && report.analysis && (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{report.analysis}</div>
              </div>
            )}

            {report.status === "error" && (
              <div className="text-center py-8 text-destructive">
                <p>Error analyzing report. Please try uploading again.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analysis;
