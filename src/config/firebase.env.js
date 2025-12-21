import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration using environment variables (optional)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCp6U3KGshdut1rvR_omci7aGJkeu7YuXg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dailyhustle-b51b8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dailyhustle-b51b8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dailyhustle-b51b8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "450245509434",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:450245509434:web:b00536a482a22452121003",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TNK0YVCTXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Analytics (only in production or when enabled)
export const analytics = typeof window !== 'undefined' && 
  (import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || import.meta.env.PROD) 
  ? getAnalytics(app) 
  : null;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Add custom parameters for better UX
  hd: import.meta.env.VITE_GOOGLE_HOSTED_DOMAIN || undefined // Optional: restrict to specific domain
});

// Configure Facebook Auth Provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');
facebookProvider.setCustomParameters({
  display: 'popup',
  auth_type: 'rerequest' // Re-request permissions if previously denied
});

// Export configuration for debugging
export const config = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  isProduction: import.meta.env.PROD,
  analyticsEnabled: !!analytics
};

export default app;