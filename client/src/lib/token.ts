import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';

export const getToken = () => Cookies.get(TOKEN_KEY);

export const hasToken = () => !!getToken();

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
  });
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY);
};
