import api from './api';

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Facebook OAuth Configuration
export const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

// Initialize Google Sign-In
export const initializeGoogleSignIn = (callback) => {
  if (typeof window === 'undefined') return;

  // Check if script already exists
  if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: callback,
      });
      renderGoogleButton();
    }
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: callback,
    });
    renderGoogleButton();
  };
  document.body.appendChild(script);
};

// Render Google Sign-In button
const renderGoogleButton = () => {
  const buttonContainer = document.getElementById('googleSignInButton');
  if (buttonContainer && window.google?.accounts?.id) {
    // Clear existing content
    buttonContainer.innerHTML = '';

    window.google.accounts.id.renderButton(buttonContainer, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: '100%',
    });
  }
};

// Trigger Google Sign-In prompt programmatically
export const triggerGoogleSignIn = () => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt();
  }
};

// Handle Google Sign-In
export const handleGoogleSignIn = async (credential) => {
  try {
    // Decode JWT to get user info
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const userInfo = JSON.parse(jsonPayload);

    // Send to backend
    const { data } = await api.post('/auth/google', {
      googleId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      profilePicture: userInfo.picture
    });

    return data;
  } catch (error) {
    throw error;
  }
};

// Initialize Facebook SDK
export const initializeFacebookSDK = () => {
  if (typeof window === 'undefined') return;

  window.fbAsyncInit = function() {
    window.FB.init({
      appId: FACEBOOK_APP_ID,
      cookie: true,
      xfbml: true,
      version: 'v18.0'
    });
  };

  // Load Facebook SDK
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
};

// Handle Facebook Login
export const handleFacebookLogin = () => {
  return new Promise((resolve, reject) => {
    window.FB.login((response) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'id,name,email,picture' }, async (userInfo) => {
          try {
            const { data } = await api.post('/auth/facebook', {
              facebookId: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              profilePicture: userInfo.picture?.data?.url
            });
            resolve(data);
          } catch (error) {
            reject(error);
          }
        });
      } else {
        reject(new Error('Facebook login failed'));
      }
    }, { scope: 'public_profile,email' });
  });
};
