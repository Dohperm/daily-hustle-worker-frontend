import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDdEq9MTF96aAiQS7rNM5hdjLZhRJw5ptw",
  authDomain: "test-project-eda23.firebaseapp.com",
  projectId: "test-project-eda23",
  storageBucket: "test-project-eda23.firebasestorage.app",
  messagingSenderId: "116924618597",
  appId: "1:116924618597:web:f35f0a2edbefeb5ef4b38c",
  measurementId: "G-R69GHBF3KZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;