import * as AuthSession from "expo-auth-session";
import { AuthRequestConfig } from "expo-auth-session";

export type AuthContextData = {
  discoveryResult: boolean; // did discovery finish ?
  isLoggedIn: boolean;
  signIn(): Promise<void>;
  signOut(): void;
  authData: AuthData;
};

export type AuthData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: any;
};

export interface KeycloakConfiguration extends Partial<AuthRequestConfig> {
  clientId: string;
  disableAutoRefresh?: boolean;
  nativeRedirectPath?: string;
  realm: string;
  refreshTimeBuffer?: number;
  scheme: string;
  tokenStorageKey?: string;
  url: string;
}
