/**
 * Return if it is client code
 * @returns {boolean} - if it is client of not.
 */
export const isClient = (): boolean => typeof window !== "undefined";

/**
 * Return host url
 * @returns {string} - host url.
 */
export const getHostUrl = () =>
  isClient()
    ? window.location.origin
    : `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`;
