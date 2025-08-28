const API_BASE_URL = 'http://localhost:3001/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorText = await response.text();
        try {
            // Try to get a structured error message from a JSON response
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || errorText);
        } catch (e) {
            // If the response is not JSON, or JSON parsing fails, use the raw text.
            // If the raw text is empty, fall back to a generic status message.
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
    }
    
    // Handle cases where response body might be empty (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        // Reading as text first avoids errors with empty bodies
        const text = await response.text();
        return text ? JSON.parse(text) : undefined as T;
    } else {
        return undefined as T;
    }
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
};