import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth-service";
import { UserRole } from "@/models/user-role.model";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authResponse = await authService.signIn({ email, password });
      if (authResponse.role !== UserRole.CASHIER) {
        toast({
          title: "Accès refusé",
          description: "Seuls les caissiers peuvent se connecter à ce système",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      localStorage.setItem("accessToken", authResponse.accessToken);
      localStorage.setItem("role", authResponse.role);
      localStorage.setItem(
        "cashier",
        JSON.stringify({
          id: authResponse.storeId,
          name: email.split("@")[0],
          email,
          role: authResponse.role,
          storeId: authResponse.storeId,
        })
      );

      toast({
        title: "Connexion réussie",
        description: `Bienvenue, vous êtes connecté en tant que caissier`,
      });

      navigate("/cash-register-opening");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erreur de connexion",
        description:
          error.response?.data?.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Point de Vente</CardTitle>
          <CardDescription>Connexion Caissier</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="caissier@pos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <p className="font-semibold mb-1">Note:</p>
            <p>
              Seuls les comptes avec le rôle "caissier" peuvent se connecter
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
