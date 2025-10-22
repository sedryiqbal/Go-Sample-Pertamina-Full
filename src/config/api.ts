// const FALLBACK_API_BASE_URL = 'http://103.197.191.216:5247';
const FALLBACK_API_BASE_URL = 'http://103.197.191.216:5000';
const GO_SAMPLE_PREFIX = '/api/go-sample';

const normalizeBaseUrl = (value?: string) => {
  if (!value) {
    return FALLBACK_API_BASE_URL;
  }

  const trimmed = value.trim();
  const withProtocol =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `http://${trimmed}`;

  return withProtocol.endsWith('/') ? withProtocol.slice(0, -1) : withProtocol;
};

const normalizePath = (path = '') => {
  if (!path) {
    return GO_SAMPLE_PREFIX;
  }

  return `${GO_SAMPLE_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;
};

export const API_BASE_URL = normalizeBaseUrl(process.env.API_BASE_URL);

export const GO_SAMPLE_API_PREFIX = GO_SAMPLE_PREFIX;

export const buildGoSampleApiPath = (path = '') => normalizePath(path);
