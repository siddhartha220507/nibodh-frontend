import React, { useState } from 'react';
import { formatTimeAgo } from '../utils/formatDate';
import { deleteItem, updateItem } from '../api/itemApi'; 
import toast from 'react-hot-toast';
import { Tweet } from 'react-tweet'; 

const ItemCard = ({ item, allItems = [], onDeleteSuccess, onUpdateSuccess }) => { 
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(item.title);
    const [editDescription, setEditDescription] = useState(item.description);
    const [editTags, setEditTags] = useState(item.tags ? item.tags.join(', ') : '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAddingHighlight, setIsAddingHighlight] = useState(false);
    const [newHighlight, setNewHighlight] = useState('');
    const [savingHighlight, setSavingHighlight] = useState(false);

    const formattedDate = formatTimeAgo(item.createdAt);
    const highlights = item.highlights || [];
    const isTweet = item.type?.toLowerCase() === 'tweet';
    const isNote = item.type?.toLowerCase() === 'note';

    // 🟢 DOMAIN NIKALNE KA LOGIC (For Fallbacks)
    const getDomainName = (url) => {
        try {
            if (!url) return 'Link';
            const domain = new URL(url).hostname.replace('www.', '');
            return domain;
        } catch (e) {
            return 'External Link';
        }
    };

    const getTweetId = (url) => {
        try { 
            const match = url.match(/\/status\/(\d+)/);
            if (match) return match[1];
            return url.split('?')[0].split('/').filter(Boolean).pop(); 
        } catch (e) { return ''; }
    };

    const getBadgeColor = (type) => {
        switch(type?.toLowerCase()) {
            case 'video': return '#ff4757'; case 'tweet': return '#1e90ff'; 
            case 'pdf': return '#ffa502'; case 'article': return '#2ed573';
            case 'note': return '#f39c12'; 
            default: return '#747d8c'; 
        }
    };

    const myTags = item.tags || [];
    const relatedItems = allItems.filter(otherItem => {
        if (otherItem._id === item._id) return false; 
        if (otherItem.title === 'Twitter User' || otherItem.title === 'Twitter Post') return false; 
        return (otherItem.tags || []).some(tag => myTags.includes(tag));
    }).slice(0, 2);

    // 🔥 PROFESSIONAL ENGLISH DELETE TOAST
    const handleDelete = (e) => {
        e.stopPropagation(); 
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Are you sure? This action cannot be undone.</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={async () => { 
                        toast.dismiss(t.id); 
                        setIsDeleting(true); 
                        const loadingToast = toast.loading('Deleting memory...'); 
                        try { 
                            await deleteItem(item._id); 
                            if (onDeleteSuccess) onDeleteSuccess(); 
                            toast.success('Memory deleted successfully!', { id: loadingToast }); 
                        } catch (error) { 
                            toast.error("Failed to delete: " + error.message, { id: loadingToast }); 
                            setIsDeleting(false); 
                        } 
                    }} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Yes, Delete</button>
                    <button onClick={() => toast.dismiss(t.id)} style={{ padding: '6px 12px', background: '#f1f2f6', color: '#555', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Cancel</button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-center' });
    };

    // 🔥 PROFESSIONAL ENGLISH UPDATE TOAST
    const handleUpdate = async (e) => {
        e.stopPropagation(); 
        setIsUpdating(true); 
        const updateToast = toast.loading('Saving changes... ✏️'); 
        try { 
            const tagsArray = editTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''); 
            await updateItem(item._id, { title: editTitle, description: editDescription, tags: tagsArray }); 
            setIsEditing(false); 
            if (onUpdateSuccess) onUpdateSuccess(); 
            toast.success('Memory updated successfully! ✨', { id: updateToast }); 
        } catch (error) { 
            toast.error("Failed to update: " + error.message, { id: updateToast }); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    const handleSaveHighlight = async (e) => {
        e.stopPropagation(); if (!newHighlight.trim()) return; setSavingHighlight(true);
        try { await updateItem(item._id, { highlights: [...highlights, newHighlight.trim()] }); setNewHighlight(''); setIsAddingHighlight(false); if (onUpdateSuccess) onUpdateSuccess(); } catch (error) { alert("Error: " + error.message); } finally { setSavingHighlight(false); }
    };

    const handleCardClick = () => {
        if (isTweet || isNote) return;
        if (item.type?.toLowerCase() === 'pdf') {
            const pdfUrl = `https://nibodh-backend.onrender.com${item.url}`; 
            window.open(pdfUrl, '_blank');
            return;
        }
        if (item.url) window.open(item.url, '_blank');
    };

    // 🔥 SMART DESCRIPTION FALLBACK LOGIC
    const isBadDescription = !item.description || item.description.includes('No description') || item.description.includes('No actual text');
    const displayDescription = isBadDescription ? `Saved from ${getDomainName(item.url)}` : item.description;

    if (isEditing) {
        return (
            <div className="smooth-pop" style={{ display: 'flex', flexDirection: 'column', padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', gap: '12px', breakInside: 'avoid', marginBottom: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Update Details
                </h4>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} placeholder="Title" />
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows="5" style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '14px', resize: 'vertical', outline: 'none' }} placeholder="Description / Note" />
                <input value={editTags} onChange={(e) => setEditTags(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} placeholder="Tags (comma separated)" />
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button onClick={handleUpdate} disabled={isUpdating} style={{ flex: 1, padding: '10px', background: 'var(--text-main)', color: 'var(--bg-color)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: '0.2s' }}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: '0.2s' }}>Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={handleCardClick} 
            className={`memory-card ${isTweet ? 'is-tweet' : ''}`} 
            style={{ 
                display: 'flex', flexDirection: 'column', 
                background: isTweet ? 'transparent' : 'var(--card-bg)',
                borderRadius: '16px', overflow: 'hidden', cursor: (isTweet || isNote) ? 'default' : 'pointer', 
                border: isTweet ? 'none' : '1px solid var(--border-color)', 
                opacity: isDeleting ? 0.5 : 1, position: 'relative',
                breakInside: 'avoid', marginBottom: '20px', color: 'var(--text-main)'
            }}
        >
            <div className="memory-actions">
                <button className="action-icon-btn" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} title="Edit Memory">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className="action-icon-btn" onClick={handleDelete} disabled={isDeleting} title="Delete Memory">
                    {isDeleting ? <span style={{fontSize: '12px'}}>⏳</span> : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    )}
                </button>
            </div>

            {isTweet ? (
                <div onClick={() => window.open(item.url, '_blank')} style={{ width: '100%', height: '220px', overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--card-bg)', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '100%', transform: 'scale(0.85)', transformOrigin: 'top center', pointerEvents: 'none' }}><Tweet id={getTweetId(item.url)} /></div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '90px', background: 'linear-gradient(to bottom, transparent 0%, var(--card-bg) 85%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1da1f2', background: 'var(--bg-color)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>View full tweet ↗</span>
                    </div>
                </div>
            ) : isNote ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(135deg, rgba(255,236,179,0.1) 0%, rgba(255,236,179,0.3) 100%)', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ background: '#f39c12', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>Quick Note ✍️</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formattedDate}</span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>"{item.description}"</p>
                </div>
            ) : (
                <>
                    <div style={{ height: '120px', width: '100%', backgroundColor: 'var(--bg-color)', position: 'relative', borderBottom: '1px solid var(--border-color)' }}>
                        {item.thumbnailUrl && item.thumbnailUrl !== 'null' && item.thumbnailUrl !== '' ? (
                            <img src={item.thumbnailUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                        ) : ( 
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(120, 120, 120, 0.05) 0%, rgba(120, 120, 120, 0.15) 100%)', color: 'var(--text-muted)' }}>
                                {item.type?.toLowerCase() === 'pdf' ? (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: '8px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                        <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', opacity: 0.7, textTransform: 'uppercase' }}>PDF Document</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: '8px' }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                        <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', opacity: 0.7, textTransform: 'uppercase' }}>{getDomainName(item.url)}</span>
                                    </>
                                )}
                            </div> 
                        )}
                    </div>
                    
                    <div style={{ padding: '12px 12px 0 12px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ background: getBadgeColor(item.type), color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', textTransform: 'capitalize' }}>{item.type || 'Link'}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formattedDate}</span>
                        </div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{item.title}</h3>
                        
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: isBadDescription ? 'var(--text-muted)' : 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4', fontStyle: isBadDescription ? 'italic' : 'normal', opacity: isBadDescription ? 0.7 : 1 }}>
                            {displayDescription}
                        </p>
                    </div>
                </>
            )}

            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, background: isTweet ? 'var(--card-bg)' : 'transparent', borderTop: isTweet ? '1px solid var(--border-color)' : 'none', borderRadius: isTweet ? '0 0 16px 16px' : '0' }}>
                {isTweet && item.description && (
                    <div style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-main)', background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #1da1f2' }}>
                        <strong style={{ opacity: 0.7, fontSize: '11px', display: 'block', marginBottom: '4px' }}>📝 YOUR NOTE</strong>
                        {item.description}
                    </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {item.tags && item.tags.map((tag, index) => (
                        <span key={index} style={{ background: 'var(--hover-bg)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>#{tag}</span>
                    ))}
                </div>
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                    {highlights.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                            {highlights.map((hl, index) => (
                                <div key={index} style={{ background: 'rgba(255, 193, 7, 0.1)', borderLeft: '4px solid #ffc107', padding: '8px 12px', fontSize: '13px', color: 'var(--text-main)', fontStyle: 'italic', borderRadius: '0 6px 6px 0', lineHeight: '1.4' }}>"{hl}"</div>
                            ))}
                        </div>
                    )}
                    {!isAddingHighlight ? (
                        <button onClick={(e) => { e.stopPropagation(); setIsAddingHighlight(true); }} style={{ background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%', textAlign: 'left', transition: '0.2s' }}>+ Add a Highlight or Quote...</button>
                    ) : (
                        <div className="smooth-pop" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-color)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                            <textarea value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} placeholder="Type an important line..." rows="2" style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '13px', resize: 'vertical', width: '100%', boxSizing: 'border-box', outline: 'none' }} autoFocus />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={handleSaveHighlight} disabled={savingHighlight || !newHighlight.trim()} style={{ flex: 1, padding: '8px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Save</button>
                                <button onClick={() => setIsAddingHighlight(false)} style={{ padding: '8px 12px', background: 'var(--hover-bg)', color: 'var(--text-main)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: '0.2s' }}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
                {relatedItems.length > 0 && (
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>🔗 Similar Saves</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {relatedItems.map(relItem => (
                                <div key={relItem._id} onClick={(e) => { e.stopPropagation(); window.open(relItem.type?.toLowerCase() === 'pdf' ? `https://nibodh-backend.onrender.com${relItem.url}` : relItem.url, '_blank'); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'var(--bg-color)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'var(--border-color)', flexShrink: 0 }}>
                                        {relItem.thumbnailUrl ? <img src={relItem.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📄</div>}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{relItem.title}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemCard;