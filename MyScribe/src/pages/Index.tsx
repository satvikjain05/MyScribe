import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">MyScribe</h1>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            Understand Your Medical Reports
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your blood tests, LFTs, and pathology reports. Get AI-powered
            explanations in simple language.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Start Analyzing Reports
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Reports</h3>
            <p className="text-muted-foreground">
              Simply upload images of your medical test reports
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
            <p className="text-muted-foreground">
              Our AI scans and interprets your medical data
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple Explanations</h3>
            <p className="text-muted-foreground">
              Get complex medical terms explained in plain language
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
