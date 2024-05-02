import { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import {
  makeRedirectUri,
  TokenResponse,
  useAuthRequest,
  useAutoDiscovery
} from "expo-auth-session";
import { AuthContext } from "../../context/AuthContext";
// import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { AuthData } from "../../types/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  //   const { getItem: getToken, setItem: setToken } = useAsyncStorage("jwtToken");

  //   const [user, setUser] = useState({} as AuthData["user"]);
  const [tokens, setTokens] = useState<string | null>(null);

  const discovery = useAutoDiscovery(
    process.env.EXPO_PUBLIC_KEYCLOAK_REALM_URL as string
  );

  const authRequestConfig = {
    responseType: AuthSession.ResponseType.Code,
    clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID as string,
    redirectUri: makeRedirectUri(),
    prompt: AuthSession.Prompt.Login,
    scopes: ["openid", "profile", "offline_access", "email"],
    usePKCE: true
  };

  // Create and load an auth request
  const [request, result, promptAsync] = useAuthRequest(
    { ...authRequestConfig },
    discovery
  );

  const signIn = async () => {
    await promptAsync();
  };

  const signOut = (): void => {
    return;
  };

  const handleTokenExchange = async (): Promise<{
    tokens: TokenResponse;
  } | null> => {
    try {
      if (result?.type === "success" && !!discovery?.tokenEndpoint) {
        const { code } = result.params;
        if (!code) {
          return null;
        }
        console.log(code);
        const tokens = await AuthSession.exchangeCodeAsync(
          { code, ...authRequestConfig },
          discovery
        );
        return { tokens };
      }

      return null;
    } catch {
      return null;
    }
  };

  const updateState = (x: { tokens: TokenResponse } | null) => {
    console.log(x);
    console.log(typeof x);

    const tokens = x?.tokens ?? null;
    if (!tokens) {
      setTokens(tokens);
      console.log(tokens);
    }
  };

  useEffect(() => {
    handleTokenExchange().then(updateState);
  }, [result]);

  return (
    <AuthContext.Provider
      value={{
        discoveryResult: true,
        isLoggedIn: !tokens,
        signIn,
        signOut,
        authData: {
          user: {
            id: "",
            name: "",
            email: ""
          },
          token: tokens
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
