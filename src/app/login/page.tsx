'use client';

import { useState } from 'react';
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
import { Activity } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);


  const handleAuthAction = async (isSignUp: boolean) => {
    if (!auth || !firestore) {
        toast({ variant: 'destructive', title: 'Firebase not initialized.' });
        return;
    }
    setLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        if (!name || !age || !gender) {
            toast({ variant: 'destructive', title: 'Please fill all fields for sign up.' });
            setLoading(false);
            return;
        }
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Create a patient document
        const patientRef = doc(firestore, 'users', user.uid, 'patients', user.uid);
        await setDoc(patientRef, {
            id: user.uid,
            name: name,
            email: user.email,
            age: parseInt(age),
            gender: gender,
        });

      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
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

  if (isUserLoading || user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className='flex flex-col items-center gap-4 mb-8'>
            <div className="flex items-center gap-3 text-primary mb-4">
                <Activity className="w-10 h-10" />
                <div>
                <h1 className="text-3xl font-bold text-gray-800">MediSynth</h1>
                <p className="text-md text-gray-600">AI-Powered Medical Records</p>
                </div>
            </div>
            <Tabs defaultValue="login" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                <Card>
                    <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Access your patient dashboard.
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
                        Create a new patient account.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name-signup">Full Name</Label>
                            <Input id="name-signup" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email-signup">Email</Label>
                            <Input id="email-signup" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password-signup">Password</Label>
                            <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age-signup">Age</Label>
                                <Input id="age-signup" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender-signup">Gender</Label>
                                <Input id="gender-signup" placeholder='M / F / Other' value={gender} onChange={(e) => setGender(e.target.value)} />
                            </div>
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
    </div>
  );
}
