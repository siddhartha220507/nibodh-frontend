// utils/formatDate.js

export const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Sometime ago';

    const date = new Date(dateString);
    const now = new Date();
    
    // Total seconds nikal lo past date aur aaj ke beech
    const seconds = Math.floor((now - date) / 1000);

    // Saal (Years)
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;

    // Mahine (Months)
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;

    // Hafte (Weeks)
    interval = Math.floor(seconds / 604800);
    if (interval >= 1) return interval === 1 ? "1 week ago" : `${interval} weeks ago`;

    // Din (Days)
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;

    // Ghante (Hours)
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval === 1 ? "1 hr ago" : `${interval} hrs ago`;

    // Minutes
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval === 1 ? "1 min ago" : `${interval} mins ago`;

    // Agar 1 minute se bhi kam time hua hai
    return "Just now";
};