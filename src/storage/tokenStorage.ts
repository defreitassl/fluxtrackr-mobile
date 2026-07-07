import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'fluxtrackr_access_token';

export function getStoredToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function storeToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function clearStoredToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

