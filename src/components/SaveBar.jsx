import React, { useState, useRef, useEffect } from 'react';
import { saveItem, uploadPdf, saveNote } from '../api/itemApi'; 
import toast from 'react-hot-toast'; 
import { Paperclip } from 'lucide-react'; 

const SaveBar = ({ onSaveSuccess, activeCollectionId }) => {
    const [url, setUrl] = useState('');
    const [btnState, setBtnState] = useState('idle'); 
    
    const [placeholderText, setPlaceholderText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    
    const inputRef = useRef(null);
    const fileInputRef = useRef(null); 

    const typingSpeed = 70; 
    const deletingSpeed = 40; 
    const pauseTime = 2000; 

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault(); 
                inputRef.current?.focus(); 
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const phrases = ["Paste a link...", "Write a quick note...", "Upload a PDF...", "Just ask... (Ctrl + K)"];
        const i = loopNum % phrases.length;
        const fullText = phrases[i];

        let ticker = setTimeout(() => {
            if (isDeleting) {
                setPlaceholderText(fullText.substring(0, placeholderText.length - 1));
            } else {
                setPlaceholderText(fullText.substring(0, placeholderText.length + 1));
            }

            if (!isDeleting && placeholderText === fullText) {
                setTimeout(() => setIsDeleting(true), pauseTime);
            } else if (isDeleting && placeholderText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        }, isDeleting ? deletingSpeed : typingSpeed);

        return () => clearTimeout(ticker);
    }, [placeholderText, isDeleting, loopNum]);

    const isUrl = (text) => {
        const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
        return urlPattern.test(text.trim());
    };

    const handleSave = async (e) => {
        e.preventDefault(); 
        const inputText = url.trim();
        // 🔥 Updated Error Message
        if (!inputText) return toast.error("Please enter a link or note first!"); 

        setBtnState('saving');
        
        try {
            if (isUrl(inputText)) {
                let finalUrl = inputText;
                if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                    finalUrl = 'https://' + finalUrl;
                }
                await saveItem({ url: finalUrl, type: 'article', collectionId: activeCollectionId || null });
            } else {
                await saveNote(inputText, activeCollectionId); 
            }
            
            setUrl(''); 
            if (onSaveSuccess) onSaveSuccess(); 
            
            setBtnState('success');
            setTimeout(() => setBtnState('idle'), 2000);

        } catch (err) {
            // 🔥 Updated Error Message
            toast.error(err.message || 'Failed to save item!');
            setBtnState('idle'); 
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            // 🔥 Updated Error Message
            return toast.error("Only PDF files are allowed!");
        }

        setBtnState('saving');
        const toastId = toast.loading("Uploading PDF..."); // Keep this English

        try {
            await uploadPdf(file, activeCollectionId);
            if (onSaveSuccess) onSaveSuccess();
            toast.success('PDF Processed!', { id: toastId }); // Keep this English
            
            setBtnState('success');
            setTimeout(() => setBtnState('idle'), 2000);
        } catch (err) {
            // 🔥 Updated Error Message
            toast.error(err.message || 'Failed to upload PDF.', { id: toastId });
            setBtnState('idle');
        } finally {
            e.target.value = null; 
        }
    };

    return (
        <form onSubmit={handleSave} className="ai-search-bar">
            <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={btnState !== 'idle'}
                title="Upload PDF"
                className="ai-orb-btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Paperclip size={16} strokeWidth={2.5} />
            </button>
            
            <input 
                ref={inputRef} 
                type="text" 
                placeholder={placeholderText} 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={btnState !== 'idle'}
                className="ai-input"
            />

            <button 
                type="submit" 
                disabled={btnState !== 'idle' || (!url && btnState === 'idle')}
                className={`pro-save-btn ai-save-btn is-${btnState}`}
            >
                {btnState === 'saving' && <div className="pro-spinner fade-in"></div>}
                {btnState === 'success' && <span className="fade-in" style={{ fontSize: '16px' }}>✓</span>}
                <span className="fade-in" key={btnState}>
                    {btnState === 'idle' ? 'Save' : btnState === 'saving' ? 'Saving...' : 'Saved'}
                </span>
            </button>
        </form>
    );
};

export default SaveBar;