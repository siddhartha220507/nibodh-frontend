import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import Sidebar from '../components/Sidebar';
import SaveBar from '../components/SaveBar';
import ItemCard from '../components/ItemCard';
import { Menu } from 'lucide-react'; // 🔥 HAMBURGER ICON IMPORT KIYA

import logoImg from '../assets/logo.jpg'; 
import { Player } from '@lottiefiles/react-lottie-player';
import { motion } from 'framer-motion'; 
import Masonry from 'react-masonry-css'; 

const Dashboard = () => {
    const { token, logout } = useAuth();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentCollection, setCurrentCollection] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    
    const [ambientMemories, setAmbientMemories] = useState([]);
    
    // 🔥 MOBILE SIDEBAR STATE
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        try {
            if (token) {
                const cleanToken = token.replace(/"/g, '');
                const payload = JSON.parse(atob(cleanToken.split('.')[1]));
                if (payload.email) setUserEmail(payload.email);
            }
        } catch (e) {
            console.error("Token parsing error:", e);
        }
    }, [token]);

    useEffect(() => {
        fetchItems(true); 
    }, [filter, currentCollection]); 

    useEffect(() => {
    const fetchAmbientMemory = async () => {
        try {
            const cleanToken = token ? token.replace(/"/g, '') : '';
            const response = await fetch('https://nibodh-backend.onrender.com/api/items/resurface', {
                headers: { 'Authorization': `Bearer ${cleanToken}` }
            });
            const data = await response.json();
            
            // 🔥 Ab pura array save karenge rotation ke liye
            if (response.ok && data.length > 0) {
                setAmbientMemories(data); 
            }
        } catch (e) {
            console.error("Ambient memory fetch fail:", e);
        }
    };

    if (token) {
        fetchAmbientMemory();
    }
}, [token]);

    const fetchItems = async (showSkeleton = true) => {
        if (showSkeleton) setLoading(true); 
        try {
            const cleanToken = token ? token.replace(/"/g, '') : '';
            
            // Default URL
            let url = `https://nibodh-backend.onrender.com/api/items?type=${filter}`;
            
            // 🛑 AGAR SURPRISE ME PE CLICK KIYA HAI:
            if (filter === 'resurface') {
                url = `https://nibodh-backend.onrender.com/api/items/resurface`;
            } else if (currentCollection) {
                url += `&collectionId=${currentCollection}`;
            }

            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${cleanToken}` } });
            const data = await response.json();
            if (response.ok) setItems(Array.isArray(data) ? data : data.items || []); 
        } catch (err) {
            setError('Failed to fetch items (server disconnected).');
        } finally {
            if (showSkeleton) setLoading(false); 
        }
    };

    const stats = {
        total: items.length,
        articles: items.filter(i => i.type?.toLowerCase() === 'article').length,
        videos: items.filter(i => i.type?.toLowerCase() === 'video').length,
        tweets: items.filter(i => i.type?.toLowerCase() === 'tweet').length, 
        pdfs: items.filter(i => i.type?.toLowerCase() === 'pdf').length,
        notes: items.filter(i => i.type?.toLowerCase() === 'note').length,     
        tags: new Set(items.flatMap(i => i.tags || [])).size 
    };

    const filteredItems = items.filter((item) => {
        // Agar resurface mode hai, toh local filtering mat karo
        if (filter !== 'all' && filter !== 'resurface' && (!item.type || item.type.toLowerCase() !== filter)) return false;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const titleMatch = item.title?.toLowerCase().includes(query);
            const descMatch = item.description?.toLowerCase().includes(query);
            const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(query));
            if (!titleMatch && !descMatch && !tagMatch) return false;
        }
        return true; 
    });

    const breakpointColumnsObj = {
        default: 3,
        1400: 3,
        1100: 2,
        700: 1 // 👈 Mobile par Masonry waise bhi 1 column kar dega
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', transition: 'background-color 0.3s' }}>
            
            {/* 🔥 SIDEBAR PROPS UPDATED */}
            <Sidebar 
                onLogout={logout} currentFilter={filter} onFilterSelect={setFilter} 
                searchQuery={searchQuery} onSearchChange={setSearchQuery}    
                stats={stats} onCollectionSelect={setCurrentCollection} 
                currentCollection={currentCollection} userEmail={userEmail}
                isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen}
                ambientMemories={ambientMemories}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '15px' }}>
                    <img src={logoImg} alt="Ni BODH" className="ni-bodh-logo" />
                </div>

                {/* 🔥 TOP BAR WITH HAMBURGER MENU */}
                <div className="dashboard-top-bar" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-color)', padding: '10px 30px 20px 30px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={20} />
                    </button>

                    <div style={{ width: '100%', maxWidth: '800px' }}>
                        <SaveBar onSaveSuccess={() => fetchItems(false)} activeCollectionId={currentCollection} />
                    </div>
                </div>

                {/* 🔥 CONTENT AREA */}
                <div className="dashboard-content-area" style={{ padding: '20px 30px 30px 30px' }}>
                    {error && <p style={{ color: '#dc3545', padding: '10px', background: 'var(--hover-bg)', borderRadius: '8px' }}>{error}</p>}

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', width: '100%', alignItems: 'start' }}>
                            {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
                            <div className="empty-lottie-wrapper">
                                <Player autoplay loop src="https://lottie.host/3089fe4c-c2a2-46a7-a1c2-dd3ee0435d86/vKihP20J6u.json" style={{ height: '260px', width: '260px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '-15px' }}>
                                <h3 style={{ margin: '0', fontSize: '24px', color: 'var(--text-main)', fontWeight: '700', letterSpacing: '-0.3px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Your Knowledge Vault is Empty</h3>
                                <p style={{ margin: '0', fontSize: '15px', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: '1.6', fontWeight: '400', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Start building your Memories and Notes. Paste a link, upload a PDF, or write a quick note to capture your memories and learnings.</p>
                            </div>
                        </div>
                    ) : (
                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="my-masonry-grid"
                            columnClassName="my-masonry-grid_column"
                        >
                            {filteredItems.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.05 }} 
                                    layout
                                    style={{ marginBottom: '20px' }} 
                                >
                                    <ItemCard 
                                        item={item} 
                                        allItems={items} 
                                        onDeleteSuccess={() => fetchItems(false)} 
                                        onUpdateSuccess={() => fetchItems(false)} 
                                    />
                                </motion.div>
                            ))}
                        </Masonry>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;