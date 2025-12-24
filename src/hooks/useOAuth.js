import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { handleRedirectResult } from '../services/auth';
import { oauthLogin, getUser } from '../services/services';
import { useAppData } from './AppDataContext';
import { toast } from 'react-toastify';

export const useOAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { setUserLoggedIn } = useAppData();

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle redirect results on app load
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          await processOAuthResult(result);
        }
      } catch (error) {
        console.error('Redirect handling error:', error);
      }
    };

    handleRedirect();
  }, []);

  // Process OAuth result and login to backend
  const processOAuthResult = async (result) => {
    setLoading(true);
    try {
      const { token, user: firebaseUser, additionalUserInfo } = result;
      
      // Send Firebase token to backend
      const response = await oauthLogin({ firebase_token: token });
      
      if (response.data?.data?.token) {
        // Store backend token
        const backendToken = response.data.data.token;
        localStorage.setItem('userToken', backendToken);
        localStorage.setItem('userLoggedIn', 'true');
        setUserLoggedIn(true);
        
        // Small delay to ensure token is set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check onboarding status from profile
        const profileResponse = await getUser();
        const accountStatus = profileResponse.data?.data?.account_status;
        
        // Show success message
        const isNewUser = additionalUserInfo?.isNewUser;
        const provider = additionalUserInfo?.providerId?.includes('google') ? 'Google' : 'Facebook';
        
        toast.success(
          isNewUser 
            ? `Welcome! Account created with ${provider}` 
            : `Welcome back! Signed in with ${provider}`
        );
        
        return {
          success: true,
          isNewUser,
          needsOnboarding: accountStatus === 'INCOMPLETE',
          user: profileResponse.data?.data
        };
      } else {
        throw new Error('No backend token received');
      }
    } catch (error) {
      console.error('OAuth processing error:', error);
      
      // Sign out from Firebase if backend login fails
      if (auth.currentUser) {
        await auth.signOut();
      }
      
      const errorMsg = error.response?.data?.message || 'Authentication failed';
      toast.error(errorMsg);
      
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  // Get current user info
  const getCurrentUser = () => {
    return {
      firebaseUser: user,
      isAuthenticated: !!user,
      email: user?.email,
      displayName: user?.displayName,
      photoURL: user?.photoURL,
      providerId: user?.providerData?.[0]?.providerId
    };
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && localStorage.getItem('userLoggedIn') === 'true';
  };

  // Get user's authentication provider
  const getAuthProvider = () => {
    if (!user?.providerData?.length) return null;
    
    const providerId = user.providerData[0].providerId;
    if (providerId.includes('google')) return 'Google';
    if (providerId.includes('facebook')) return 'Facebook';
    return providerId;
  };

  return {
    loading,
    authLoading,
    user,
    processOAuthResult,
    getCurrentUser,
    isAuthenticated,
    getAuthProvider
  };
};