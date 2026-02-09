
'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/context/admin-context';
import { useToast } from '@/hooks/use-toast';

interface AdminLoginProps {
    onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAdmin();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'axrn' && login(password)) {
      toast({ title: 'Login Successful', description: 'Welcome, Admin!' });
      onLoginSuccess();
    } else {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid username or password.' });
    }
  };

  return (
    <Card className="w-full max-w-sm bg-card/30 backdrop-blur-lg border-primary/20 animate-in fade-in zoom-in-95">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Shield className="text-primary w-12 h-12" />
            </div>
            <CardTitle className="text-2xl text-primary-foreground">Admin Access</CardTitle>
            <CardDescription>Enter your credentials to manage the application.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="bg-input"
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-input"
                        required 
                    />
                </div>
                <Button type="submit" className="w-full">
                    Log In
                </Button>
            </form>
        </CardContent>
    </Card>
  );
}
