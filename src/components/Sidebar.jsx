import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, Trash2, Check, X,
  LayoutGrid, FileText, Video, MessageSquare, File, PenTool, 
  LogOut, ChevronLeft, ChevronRight, Network, 
  FolderClosed, ChevronDown, Plus, AlertTriangle, Sparkles
} from 'lucide-react'; 
import toast from 'react-hot-toast'; 
import { getCollections, createCollection, deleteCollection } from '../api/itemApi';
// 🔥 NAYA IMPORT: Token lene ke liye useAuth
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onLogout, currentFilter, onFilterSelect, searchQuery, onSearchChange, onCollectionSelect, currentCollection, stats, userEmail, isMobileOpen, setIsMobileOpen, ambientMemories = [] }) => {
    // 🔥 NAYA HOOK: Context se token nikalne ke liye
    const { token } = useAuth();
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);
    const [collections, setCollections] = useState([]);
    
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [folderToDelete, setFolderToDelete] = useState(null);
    
    const [memoryIndex, setMemoryIndex] = useState(0);

    const navigate = useNavigate();
    const firstLetter = userEmail ? userEmail.charAt(0) : 'S';

    const libraryItems = [
        { id: 'resurface', label: 'Surprise Me', icon: Sparkles },
        { id: 'all', label: 'All Memories', icon: LayoutGrid },
        { id: 'article', label: 'Articles', icon: FileText },
        { id: 'video', label: 'Videos', icon: Video },
        { id: 'tweet', label: 'Tweets', icon: MessageSquare }, 
        { id: 'pdf', label: 'PDFs', icon: File },
        { id: 'note', label: 'Quick Notes', icon: PenTool }
    ];

    useEffect(() => { fetchRealCollections(); }, []);

    const fetchRealCollections = async () => {
        try {
            const data = await getCollections();
            setCollections(Array.isArray(data) ? data : []);
        } catch (e) { console.error("Failed to load collections:", e); }
    };

    useEffect(() => {
        if (!ambientMemories || ambientMemories.length <= 1) return;
        const interval = setInterval(() => {
            setMemoryIndex((prevIndex) => (prevIndex + 1) % ambientMemories.length);
        }, 5000); 
        
        return () => clearInterval(interval);
    }, [ambientMemories]);

    const getTimeAgo = (dateString) => {
        if (!dateString) return "some time ago";
        const diff = new Date() - new Date(dateString);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "today";
        if (days === 1) return "yesterday";
        return `${days} days ago`;
    };

    const submitFolder = async () => {
        if (!newFolderName.trim()) { setIsCreatingFolder(false); return; }
        const loadingToast = toast.loading('Creating folder...'); 
        try {
            const newCol = await createCollection(newFolderName.trim());
            setCollections([...collections, newCol]);
            toast.success('Folder created successfully! 📂', { id: loadingToast }); 
            setNewFolderName(''); setIsCreatingFolder(false); 
        } catch (e) { toast.error("Failed to create folder.", { id: loadingToast }); }
    };

    const confirmDeleteFolder = async () => {
        if (!folderToDelete) return;
        const id = folderToDelete;
        const loadingToast = toast.loading('Deleting folder...');
        try {
            await deleteCollection(id);
            setCollections(collections.filter(c => c._id !== id));
            if(currentCollection === id) {
                if(onCollectionSelect) onCollectionSelect(null);
                onFilterSelect('all');
            }
            toast.success("Folder deleted successfully!", { id: loadingToast }); 
        } catch (e) { toast.error("Failed to delete folder.", { id: loadingToast }); }
        setFolderToDelete(null); 
    };

    // 🔥 NAYA FUNCTION: Token copy karne ke liye
    const copyTokenToClipboard = () => {
        if (token) {
            const cleanToken = token.replace(/"/g, ''); // Clean any extra quotes
            navigator.clipboard.writeText(cleanToken);
            toast.success("Token copied! Paste it in the Extension. 🔗");
        } else {
            toast.error("No token found. Please login again.");
        }
    };

    const currentAmbient = ambientMemories[memoryIndex];

    return (
        <>
            <div className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}></div>

            <div className={`shadcn-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', padding: '16px', borderBottom: '1px solid var(--border-color)', height: '60px' }}>
                    {!isCollapsed && (
                        <div className="user-profile-badge" title={userEmail}>
                            <div className="avatar-circle">{firstLetter}</div>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{userEmail || "Second Brain"}</span>
                        </div>
                    )}
                    <button className="desktop-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                    <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}><X size={20} /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="shadcn-group-label">Library</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {libraryItems.map((item) => {
                            const count = stats ? (item.id === 'all' ? stats.total : stats[item.id + 's']) : 0;
                            return (
                                <div key={item.id} onClick={() => { onFilterSelect(item.id); if (onCollectionSelect) onCollectionSelect(null); setIsMobileOpen(false); }} className={`shadcn-item ${currentFilter === item.id && !currentCollection ? 'active' : ''}`}>
                                    <item.icon size={18} /><span>{item.label}</span>
                                    {item.id !== 'resurface' && !isCollapsed && <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.6, background: 'var(--border-color)', padding: '2px 6px', borderRadius: '10px' }}>{count || 0}</span>}
                                </div>
                            );
                        })}
                    </div>

                    {!isCollapsed && currentAmbient && (
                        <div className="smooth-pop" key={currentAmbient._id} style={{
                            margin: '15px', padding: '15px',
                            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                            borderRadius: '12px', border: '1px solid rgba(0, 229, 255, 0.2)',
                            position: 'relative', flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#00e5ff', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <Sparkles size={14} /> Memory Lane
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
                                You saved this {getTimeAgo(currentAmbient.createdAt)}...
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                                {currentAmbient.title}
                            </div>
                            <button 
                                onClick={() => window.open(currentAmbient.type?.toLowerCase() === 'pdf' ? `https://nibodh-backend.onrender.com${currentAmbient.url}` : currentAmbient.url, '_blank')}
                                style={{ background: 'var(--text-main)', color: 'var(--bg-color)', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%', transition: '0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Revisit
                            </button>
                        </div>
                    )}

                    <div className="shadcn-group-label" style={{ marginTop: '10px', display: isCollapsed ? 'none' : 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}>
                        <span>Collections</span>
                        {isCollectionsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    
                    <div style={{ display: isCollectionsOpen && !isCollapsed ? 'block' : 'none' }}>
                        {collections.map(col => (
                            <div key={col._id} onClick={() => { if (onCollectionSelect) onCollectionSelect(col._id); setIsMobileOpen(false); }} className={`shadcn-sub-item group ${currentCollection === col._id ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
                                    <FolderClosed size={14} style={{ marginRight: '10px', flexShrink: 0 }} />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.title}</span>
                                </div>
                                <div className="collection-actions" style={{ display: 'none' }}>
                                    <button onClick={(e) => { e.stopPropagation(); setFolderToDelete(col._id); }} style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }} title="Delete Folder"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}

                        {isCreatingFolder ? (
                            <div className="shadcn-sub-item active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                    <FolderClosed size={14} style={{ marginRight: '8px', opacity: 0.7 }} />
                                    <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitFolder(); if (e.key === 'Escape') { setIsCreatingFolder(false); setNewFolderName(''); } }} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #00e5ff', color: 'var(--text-main)', outline: 'none', fontSize: '13px', padding: '2px 0' }} placeholder="Name & Enter..." />
                                </div>
                                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                                    <button onClick={submitFolder} style={{ background: 'transparent', border: 'none', color: '#00e5ff', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Save"><Check size={14} /></button>
                                    <button onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }} style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', padding: '2px', display: 'flex' }} title="Cancel"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => setIsCreatingFolder(true)} className="shadcn-sub-item" style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                                <Plus size={14} style={{ marginRight: '10px' }} /> Create New...
                            </div>
                        )}
                    </div>
                </div>

                {/* 🔥 NAYA FOOTER: Yahan Naya Button Add Kiya Hai */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <div onClick={() => navigate('/graph')} className="shadcn-item"><Network size={18} /><span>Graph View</span></div>
                    
                    {/* 🔥 THE NEW CONNECT EXTENSION BUTTON */}
                    <div onClick={copyTokenToClipboard} className="shadcn-item" style={{ color: '#00e5ff' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Connect Extension</span>
                    </div>

                    <div onClick={onLogout} className="shadcn-item" style={{ color: '#ef4444' }}><LogOut size={18} /><span>Logout</span></div>
                </div>

                {folderToDelete && (
                    <div onClick={() => setFolderToDelete(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                        <div className="smooth-pop" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', width: '90%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', padding: '10px', borderRadius: '50%' }}><AlertTriangle size={24} /></div>
                                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px' }}>Delete Folder?</h3>
                            </div>
                            <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>Are you sure you want to delete this folder? All memories inside will be moved to "All Memories".</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setFolderToDelete(null)} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' }}>Cancel</button>
                                <button onClick={confirmDeleteFolder} style={{ flex: 1, padding: '10px', background: '#ff4757', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' }}>Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;