/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const SERVER_ID = "interviewace.ai";

export const isNativePlatform = (): boolean => {
  return false;
};

export const checkBiometricAvailability = async (): Promise<{
  available: boolean;
  biometryType?: string;
  isSimulated?: boolean;
}> => {
  // Return true for simulation in web browser so user can test the UI
  const simulatedSaved = localStorage.getItem("biometric_simulated_saved") === "true";
  return {
    available: true,
    biometryType: "Simulated TouchID/FaceID",
    isSimulated: true
  };
};

export const isCredentialsSaved = async (): Promise<boolean> => {
  return localStorage.getItem("biometric_simulated_saved") === "true";
};

export const saveBiometricCredentials = async (username: string, envPasswordOrToken: string): Promise<void> => {
  localStorage.setItem("biometric_simulated_saved", "true");
  localStorage.setItem("biometric_simulated_user", username);
  localStorage.setItem("biometric_simulated_pass", envPasswordOrToken);
};

export const deleteBiometricCredentials = async (): Promise<void> => {
  localStorage.removeItem("biometric_simulated_saved");
  localStorage.removeItem("biometric_simulated_user");
  localStorage.removeItem("biometric_simulated_pass");
};

export const performBiometricVerification = async (reasonText: string = "Log in to your account"): Promise<boolean> => {
  // Simulated verification of identity
  return true; // Web UI will trigger simulated pin/fingerprint dialog for feedback
};

export const getBiometricCredentials = async (): Promise<{ username?: string; password?: string } | null> => {
  const user = localStorage.getItem("biometric_simulated_user");
  const pass = localStorage.getItem("biometric_simulated_pass");
  if (user && pass) {
    return { username: user, password: pass };
  }
  return null;
};
