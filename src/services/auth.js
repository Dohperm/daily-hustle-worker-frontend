import { signInWithPopup, signInWithRedirect, getRedirectResult, AuthErrorCodes } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { toast } from 'react-toastify';

// Helper function to handle auth errors
const handleAuthError = (error, provider) => {
  console.error(`${provider} auth error:`, error);
  
  switch (error.code) {
    case AuthErrorCodes.POPUP_BLOCKED:
      toast.error(`Popup blocked. Please allow popups for ${provider} sign-in.`);
      break;
    case AuthErrorCodes.POPUP_CLOSED_BY_USER:
      toast.warning('Sign-in cancelled.');
      break;
    case AuthErrorCodes.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
      toast.error('An account already exists with this email using a different sign-in method.');
      break;
    case AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE:
      toast.error('This credential is already associated with a different account.');
      break;
    case AuthErrorCodes.OPERATION_NOT_ALLOWED:
      toast.error(`${provider} sign-in is not enabled. Please contact support.`);
      break;
    case AuthErrorCodes.INVALID_EMAIL:
      toast.error('Invalid email address.');
      break;
    case AuthErrorCodes.USER_DISABLED:
      toast.error('This account has been disabled.');
      break;
    case AuthErrorCodes.TOO_MANY_REQUESTS:
      toast.error('Too many failed attempts. Please try again later.');
      break;
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      toast.error('Network error. Please check your connection and try again.');
      break;
    default:
      toast.error(`${provider} sign-in failed. Please try again.`);
  }
};

// Google Sign-In
export const signInWithGoogle = async (useRedirect = false) => {
  try {
    let result;
    
    if (useRedirect) {
      // Use redirect method for mobile or when popup is blocked
      await signInWithRedirect(auth, googleProvider);
      result = await getRedirectResult(auth);
      if (!result) {
        throw new Error('Redirect result is null');
      }
    } else {
      // Use popup method (default)
      result = await signInWithPopup(auth, googleProvider);
    }
    
    const token = await result.user.getIdToken();
    
    return {
      user: result.user,
      token,
      additionalUserInfo: result.additionalUserInfo,
      credential: result.credential
    };
  } catch (error) {
    // If popup is blocked, try redirect method
    if (error.code === AuthErrorCodes.POPUP_BLOCKED && !useRedirect) {
      toast.info('Popup blocked. Redirecting to Google sign-in...');
      return signInWithGoogle(true);
    }
    
    handleAuthError(error, 'Google');
    throw error;
  }
};

// Facebook Sign-In
export const signInWithFacebook = async (useRedirect = false) => {
  try {
    let result;
    
    if (useRedirect) {
      // Use redirect method for mobile or when popup is blocked
      await signInWithRedirect(auth, facebookProvider);
      result = await getRedirectResult(auth);
      if (!result) {
        throw new Error('Redirect result is null');
      }
    } else {
      // Use popup method (default)
      result = await signInWithPopup(auth, facebookProvider);
    }
    
    const token = await result.user.getIdToken();
    
    return {
      user: result.user,
      token,
      additionalUserInfo: result.additionalUserInfo,
      credential: result.credential
    };
  } catch (error) {
    // If popup is blocked, try redirect method
    if (error.code === AuthErrorCodes.POPUP_BLOCKED && !useRedirect) {
      toast.info('Popup blocked. Redirecting to Facebook sign-in...');
      return signInWithFacebook(true);
    }
    
    handleAuthError(error, 'Facebook');
    throw error;
  }
};

// Handle redirect result on app load
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const token = await result.user.getIdToken();
      return {
        user: result.user,
        token,
        additionalUserInfo: result.additionalUserInfo,
        credential: result.credential
      };
    }
    return null;
  } catch (error) {
    console.error('Redirect result error:', error);
    handleAuthError(error, 'OAuth');
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('userToken');
    localStorage.removeItem('userLoggedIn');
    toast.success('Signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    toast.error('Failed to sign out');
    throw error;
  }
};