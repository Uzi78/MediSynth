'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Activity, User, Stethoscope, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

type Role = 'patient' | 'doctor';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleAuthAction = async (isSignUp: boolean) => {
    if (!auth || !firestore || !selectedRole) {
      toast({ variant: 'destructive', title: 'Something went wrong. Please select a role.' });
      return;
    }
    setLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Save user role to Firestore
        await setDoc(doc(firestore, 'users', user.uid), {
          role: selectedRole,
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
            <Card 
                className={cn("cursor-pointer hover:border-primary transition-all", selectedRole === 'patient' && "border-primary border-2")}
                onClick={() => setSelectedRole('patient')}
            >
                <CardContent className="p-6 flex flex-col items-center justify-center">
                    <User className="w-12 h-12 mb-4 text-primary" />
                    <h3 className="font-semibold text-lg">Patient</h3>
                </CardContent>
            </Card>
            <Card
                className={cn("cursor-pointer hover:border-primary transition-all", selectedRole === 'doctor' && "border-primary border-2")}
                onClick={() => setSelectedRole('doctor')}
            >
                <CardContent className="p-6 flex flex-col items-center justify-center">
                    <Stethoscope className="w-12 h-12 mb-4 text-primary" />
                    <h3 className="font-semibold text-lg">Doctor</h3>
                </CardContent>
            </Card>
        </div>
    </div>
  );

  const renderAuthForm = () => (
    <div>
        <Button variant="ghost" onClick={() => setSelectedRole(null)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to role selection
        </Button>
        <Tabs defaultValue="login" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login as {selectedRole}</TabsTrigger>
            <TabsTrigger value="signup">Sign Up as {selectedRole}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
            <Card>
                <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                    Access your {selectedRole} dashboard.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input id="email-login" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleAuthAction(false)} disabled={loading} className="w-full">
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
                </CardFooter>
            </Card>
            </TabsContent>
            <TabsContent value="signup">
            <Card>
                <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                    Create a new {selectedRole} account.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <Input id="email-signup" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-signup">Password</Label>
                        <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleAuthAction(true)} disabled={loading} className="w-full">
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
                </CardFooter>
            </Card>
            </TabsContent>
        </Tabs>
    </div>
  );

  if (isUserLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="absolute top-4 right-4">
            <ThemeToggle />
        </div>
        <div className='flex flex-col items-center gap-4 mb-8'>
            <div className="flex items-center gap-3 text-primary mb-4">
                <Activity className="w-10 h-10" />
                <div>
                <h1 className="text-3xl font-bold text-foreground">MediSynth</h1>
                <p className="text-md text-muted-foreground">AI-Powered Medical Records</p>
                </div>
            </div>
            {selectedRole ? renderAuthForm() : renderRoleSelection()}
        </div>
    </div>
  );
}
