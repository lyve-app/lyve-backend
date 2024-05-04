import { AuthRequestConfig } from "expo-auth-session";

export type AuthContextData = {
  discoveryResult: boolean; // did discovery finish ?
  isLoggedIn: boolean;
  signIn(): Promise<void>;
  signOut(): void;
  user: {
    id: string;
    emailVerified: boolean;
    fullName: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};

export interface KeycloakConfiguration extends Partial<AuthRequestConfig> {
  clientId: string;
  realmUrl: string;
  scheme: string;
}
