import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCp6U3KGshdut1rvR_omci7aGJkeu7YuXg",
  authDomain: "dailyhustle-b51b8.firebaseapp.com",
  projectId: "dailyhustle-b51b8",
  storageBucket: "dailyhustle-b51b8.firebasestorage.app",
  messagingSenderId: "450245509434",
  appId: "1:450245509434:web:b00536a482a22452121003",
  measurementId: "G-TNK0YVCTXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Facebook Auth Provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.setCustomParameters({
  display: 'popup'
});

export default app;