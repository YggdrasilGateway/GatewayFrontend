import axios, { InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'auth/token.value';
const TOKEN_EXPIRE = 'auth/token.expire';

let tokenExpireTime: undefined | number | null = undefined;

export function isLogin() {
  return !isTokenExpired();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getTokenExpireTime() {
  if (tokenExpireTime !== undefined) {
    return tokenExpireTime;
  }
  const texp = localStorage.getItem(TOKEN_EXPIRE);
  if (!texp) {
    return (tokenExpireTime = null);
  }
  return (tokenExpireTime = parseInt(texp));
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setTokenExpireTime(time: number) {
  tokenExpireTime = time;
  localStorage.setItem(TOKEN_EXPIRE, time.toString());
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRE);
}

export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  const now = Date.now() / 1000;
  const tokenExpireTime = getTokenExpireTime();
  if (tokenExpireTime) {
    return Date.now() > tokenExpireTime;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    const payload = JSON.parse(atob(parts[1]));
    if (!payload || typeof payload.exp !== 'number') {
      return true;
    }
    return payload.exp < now;
  } catch (e) {
    return true;
  }
}

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url.startsWith('/api')) {
      // let each request carry token
      // this example using the JWT token
      // Authorization is a custom headers key
      // please modify it according to the actual situation
      const token = getToken();
      if (token) {
        if (!config.headers) {
          (config as any).headers = {};
        }
        config.headers.Authorization = `token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);

function refreshToken() {
  const exp = getTokenExpireTime();
  if (!exp) return;
  if (!getToken()) return;
  const now = Date.now();
  // console.log(exp, now, exp - now)

  if (exp - now <= 1000 * 60 && exp > now) {
    axios.post('/api/user/refresh-jwt', {}).then((e) => {
      if (e.status == 200) {
        console.log("Refreshed token with ", e.data)
        setToken(e.data.data.token);
        setTokenExpireTime(e.data.data.validToTimestamp);
      }
    });
  }
}

setInterval(refreshToken, 1000);

setTimeout(() => {
  if (!getToken()) return;

  axios.post('/api/user/refresh-jwt', {}).then((e) => {
    if (e.status != 200) {
      clearToken();
      if (!window.location.href.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
  });
}, 1000);
