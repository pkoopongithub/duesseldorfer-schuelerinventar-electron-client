// API Service
const apiBaseUrl = 'https://paul-koop.org/api/';

async function apiCall(endpoint, method, data = null, customHeaders = {}) {
    const headers = await getAuthHeaders();
    
    const result = await window.electronAPI.apiCall(
        endpoint,
        method,
        data,
        { ...headers, ...customHeaders }
    );
    
    return result;
}

async function getAuthHeaders() {
    const userId = await window.electronAPI.storeGet('userId');
    const session = await window.electronAPI.storeGet('session');
    
    if (userId && session) {
        return {
            'X-User-ID': userId,
            'X-Session': session
        };
    }
    return {};
}