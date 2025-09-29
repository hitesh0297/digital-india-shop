// responseInterceptors.js
import store from '../store.js';
import { logout } from '../actions/userActions.js';
import api from './axios.js';

export const responseInterceptors = () => {
  api.interceptors.response.use(
    (response) => response,

    async (error) => {
      console.log("🚨 Interceptor caught error:", error);

      // If no response, maybe network error
      if (!error.response) return Promise.reject(error);

      const { response, config: originalRequest } = error;
      const status = response.status;

      // ✅ Skip URLs that should not redirect
      const skipUrls = ['/auth/login', '/auth/register'];
      const requestUrl = originalRequest?.url || '';

      // ✅ Only handle 401, not other codes
      if (
        status === 401 &&
        !skipUrls.some(url => requestUrl.includes(url))
      ) {
        // 🧠 Prevent loops: mark request as retried
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          alert('Login to start');
          store.dispatch(logout())
        }
      }

      return Promise.reject(error);
    }
  );
};
