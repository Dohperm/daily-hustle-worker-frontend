import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { toast } from 'react-toastify';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { user: result.user, token };
  } catch (error) {
    toast.error('Google sign-in failed');
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const token = await result.user.getIdToken();
    return { user: result.user, token };
  } catch (error) {
    toast.error('Facebook sign-in failed');
    throw error;
  }
};