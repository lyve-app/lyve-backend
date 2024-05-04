import { useCallback, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import {
  makeRedirectUri,
  TokenResponse,
  useAuthRequest,
  useAutoDiscovery,
  revokeAsync,
  refreshAsync,
  TokenResponseConfig
} from "expo-auth-session";
import { AuthContext } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContextData, KeycloakConfiguration } from "../../types/auth";

// This is needed for ios
import { decode } from "base-64";
global.atob = decode;
interface AuthProviderProps {
  children: React.ReactNode;
  config: KeycloakConfiguration;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children, config }) => {
  const [user, setUser] = useState<AuthContextData["user"]>(
    {} as AuthContextData["user"]
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const discovery = useAutoDiscovery(config.realmUrl);

  const redirectUri = makeRedirectUri({
    scheme: config.scheme
  });

  const authRequestConfig = {
    responseType: AuthSession.ResponseType.Code,
    clientId: config.clientId,
    redirectUri,
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

  const signOut = async (): Promise<void> => {
    if (discovery?.revocationEndpoint) {
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (accessToken) {
        setUser({} as AuthContextData["user"]); // remove userData
        const revokeResponse = await revokeAsync(
          {
            token: accessToken,
            clientId: config.clientId
          },
          discovery
        );

        if (revokeResponse) {
          setUser({} as AuthContextData["user"]); // remove userData
          await AsyncStorage.multiRemove(["accessToken", "tokenConfig"]);
          setIsLoggedIn(false);
        }
      }
    }
  };

  const handleTokenExchange = useCallback(async (): Promise<{
    tokens: TokenResponse;
  } | null> => {
    try {
      if (result?.type === "success" && !!discovery?.tokenEndpoint) {
        const { code } = result.params;

        if (!code) {
          return null;
        }

        const tokens: TokenResponse = await AuthSession.exchangeCodeAsync(
          {
            code,
            redirectUri,
            clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID as string,
            extraParams: {
              code_verifier: request?.codeVerifier as string
            }
          },
          discovery
        );

        return { tokens };
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [discovery, redirectUri, request, result]);

  const updateState = async (x: { tokens: TokenResponse } | null) => {
    const tokens = x?.tokens ?? null;

    if (tokens) {
      await AsyncStorage.multiSet([
        ["tokenConfig", JSON.stringify(tokens)],
        ["accessToken", tokens.accessToken]
      ]);

      if (tokens.idToken) {
        // set user data
        const userData: any = jwtDecode(tokens.idToken); // not beautiful but it works

        setUser({
          id: userData.sub,
          emailVerified: userData.email_verified,
          fullName: userData.name,
          username: userData.preferred_name,
          first_name: userData.given_name,
          last_name: userData.family_name,
          email: userData.email
        });

        setIsLoggedIn(true);
      }
    }
  };

  const handleRefresh = useCallback(async () => {
    const tokenConfigString = await AsyncStorage.getItem("tokenConfig");

    if (tokenConfigString && isLoggedIn) {
      const tokenConfig: TokenResponseConfig = JSON.parse(tokenConfigString);
      if (tokenConfig && tokenConfig.refreshToken && discovery?.tokenEndpoint) {
        // instantiate a new token response object which will allow us to refresh
        let tokenResponse = new TokenResponse(tokenConfig);
        // shouldRefresh checks the expiration and makes sure there is a refresh token
        if (tokenResponse.shouldRefresh()) {
          tokenResponse = await refreshAsync(
            {
              clientId: config.clientId,
              refreshToken: tokenConfig.refreshToken
            },
            discovery
          );
        }

        // update tokenConfig, accesToken and user
        updateState({ tokens: tokenResponse });
      }
    }
  }, [config.clientId, discovery]);

  useEffect(() => {
    handleTokenExchange().then(updateState);
  }, [handleTokenExchange, result]);

  useEffect(() => {
    if (isLoggedIn) {
      const refreshInterval = setInterval(() => {
        handleRefresh();
      }, 2 * 60 * 1000); // Refresh every 2 min

      return () => clearInterval(refreshInterval);
    }
  }, [handleRefresh, isLoggedIn]);

  return (
    <AuthContext.Provider
      value={{
        discoveryResult: !result,
        isLoggedIn,
        signIn,
        signOut,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
