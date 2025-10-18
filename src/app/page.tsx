import { ArrowRight, Stethoscope, User, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { ThemeToggle } from '@/components/theme-toggle';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-card p-6 rounded-lg shadow-md border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all">
    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 sm:p-6 lg:p-8 flex justify-between items-center">
        <div className="flex items-center gap-3 text-primary">
          <Activity className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">MediSynth</h1>
          </div>
        </div>
        <div className='flex items-center gap-4'>
            <Link href="/login">
                <Button>Login / Sign Up</Button>
            </Link>
            <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Your Health Story, Unified and Understood
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            MediSynth uses AI to digitize, structure, and summarize your medical records, giving you a clear, consolidated view of your health.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="group">
                For Patients <User className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="group">
                For Doctors <Stethoscope className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Intelligent Health Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Stethoscope className="w-6 h-6" />}
                title="AI-Powered Extraction"
                description="Our pipeline uses OCR and advanced AI to automatically extract diagnoses, medications, and lab results from any medical document."
              />
              <FeatureCard
                icon={<User className="w-6 h-6" />}
                title="Consolidated Reports"
                description="View a unified health summary and track lab result trends over time with interactive charts. All your data in one place."
              />
              <FeatureCard
                icon={<ArrowRight className="w-6 h-6" />}
                title="Secure and Private"
                description="Your data is your own. With secure user authentication and Firestore security rules, your health information remains private."
              />
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
            <div className="max-w-4xl mx-auto text-center">
                 <h2 className="text-3xl font-bold mb-12">Simple Steps to Clarity</h2>
                 <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-card text-primary rounded-full text-2xl font-bold shadow-md border mb-4">1</div>
                        <h3 className="font-semibold text-lg">Upload Documents</h3>
                        <p className="text-muted-foreground text-sm">Drag and drop images or PDFs of your medical records.</p>
                    </div>
                    <ArrowRight className="text-primary/50 hidden md:block" />
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-card text-primary rounded-full text-2xl font-bold shadow-md border mb-4">2</div>
                        <h3 className="font-semibold text-lg">AI Analysis</h3>
                        <p className="text-muted-foreground text-sm">MediSynth's AI pipeline extracts and structures your data.</p>
                    </div>
                    <ArrowRight className="text-primary/50 hidden md:block" />
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-card text-primary rounded-full text-2xl font-bold shadow-md border mb-4">3</div>
                        <h3 className="font-semibold text-lg">View Your Report</h3>
                        <p className="text-muted-foreground text-sm">Access your unified and easy-to-understand health summary.</p>
                    </div>
                 </div>
            </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} MediSynth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
