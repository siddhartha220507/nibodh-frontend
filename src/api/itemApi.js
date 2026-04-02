import axios from 'axios';

const API_URL = 'http://localhost:5000/api/items';

// 🛠 Pro-Tip: Ek helper function bana liya taaki baar-baar headers na likhne padein
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
};
// Tere existing imports aur functions ke neeche ye add kar de:

// 1. PDF Upload API (FormData ke sath)
// 1. PDF Upload API (FormData ke sath)
export const uploadPdf = async (file, collectionId) => { // 👈 collectionId add kiya
    const formData = new FormData();
    formData.append('file', file);
    
    if (collectionId) {
        formData.append('collectionId', collectionId); // 👈 Backend ko batayega kis folder me save karna hai
    }

    const token = localStorage.getItem('token')?.replace(/"/g, ''); 

    const response = await fetch('https://nibodh-backend.onrender.com/api/items/upload-pdf', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // FormData ke sath 'Content-Type' nahi likhte!
        },
        body: formData
    });

    if (!response.ok) throw new Error('PDF upload fail ho gaya');
    return await response.json();
};

// 2. Note Save API
export const saveNote = async (noteText, collectionId) => { // 👈 collectionId add kiya
    const token = localStorage.getItem('token');
    
    // 🔥 THE FIX: Har note ke liye ek unique URL generate karo (Milliseconds ka use karke)
    const uniqueUrl = `quick-note-${Date.now()}`; 

    const response = await fetch('https://nibodh-backend.onrender.com/api/items/save', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        // 👇 Yahan fixed 'quick-note' ki jagah uniqueUrl bhej rahe hain
        body: JSON.stringify({ url: uniqueUrl, type: 'note', description: noteText }) 
    });

    if (!response.ok) throw new Error('Note save nahi hua (Server Error)');
    return await response.json();
};


// 1. Saare items fetch karna (Dashboard ke mount hone par chalega)
export const getAllItems = async () => {
    try {
        // Headers ko second argument ki tarah paas kiya
        const response = await axios.get(API_URL, getAuthHeaders());
        return response.data; 
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch items.';
        throw new Error(message);
    }
};

// 2. Naya item save karna (SaveBar se trigger hoga)
export const saveItem = async (itemData) => {
    try {
        // POST request mein data second argument hota hai, aur headers third
        const response = await axios.post(`${API_URL}/save`, itemData, getAuthHeaders());
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to save item.';
        throw new Error(message);
    }
};

// 3. Items search karna (Search bar se trigger hoga)
export const searchItems = async (query) => {
    try {
        // Query param ko URL mein attach kiya
        const response = await axios.get(`${API_URL}/search?query=${query}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        const message = error.response?.data?.error || 'Search failed.';
        throw new Error(message);
    }
};
export const deleteItem = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete item.';
        throw new Error(message);
    }
};

// 5. Update Item (Tags ya title edit karne ke liye)
export const updateItem = async (id, updatedData) => {
    try {
        // PUT request mein data aur headers dono jaate hain
        const response = await axios.put(`${API_URL}/${id}`, updatedData, getAuthHeaders());
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to update item.';
        throw new Error(message);
    }
};

// 6. Resurface Items (Purane bhule hue links wapas yaad dilane ke liye)
export const resurfaceItems = async (days = 7) => {
    try {
        // Backend mein humne days parameter manga tha, default 7 din rakh lete hain
        const response = await axios.get(`${API_URL}/resurface?days=${days}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to resurface items.';
        throw new Error(message);
    }
};

// 📂 Collections Fetch Karna
export const getCollections = async () => {
    try {
        const response = await axios.get('https://nibodh-backend.onrender.com/api/collections', getAuthHeaders());
        return response.data;
    } catch (error) { throw new Error('Collections fetch fail!'); }
};

// ➕ Naya Collection Banana
export const createCollection = async (title) => {
    try {
        const response = await axios.post('https://nibodh-backend.onrender.com/api/collections', { title }, getAuthHeaders());
        return response.data;
    } catch (error) { throw new Error('Collection creation fail!'); }
};

export const deleteCollection = async (id) => {
    try {
        const token = localStorage.getItem('token')?.replace(/"/g, '');
        const response = await axios.delete(`https://nibodh-backend.onrender.com/api/collections/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Collection delete fail!');
    }
};