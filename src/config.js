// API Configuration - Simple & Safe
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Use Railway URL if env var is missing (temporary fallback)
  return apiUrl || 'https://trackitai-production.up.railway.app';
};

const config = {
  apiUrl: getApiUrl()
};

// Simple debug logging (only in browser)
if (typeof window !== 'undefined') {
  console.log('🔧 TrackIt Config:', {
    'API URL': config.apiUrl,
    'Environment': process.env.NODE_ENV || 'unknown'
  });
}

export default config;