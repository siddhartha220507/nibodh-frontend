import React from 'react';

const SkeletonCard = () => {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', 
            background: 'var(--card-bg)', // 👈 Updated
            borderRadius: '12px', overflow: 'hidden', 
            border: '1px solid var(--border-color)', // 👈 Updated
            minHeight: '350px' 
        }}>
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; background-color: var(--border-color); }
                        50% { opacity: 0.5; background-color: var(--hover-bg); }
                        100% { opacity: 1; background-color: var(--border-color); }
                    }
                    .skeleton-pulse {
                        animation: pulse 1.5s ease-in-out infinite;
                        border-radius: 4px;
                    }
                `}
            </style>

            <div className="skeleton-pulse" style={{ height: '160px', width: '100%', borderRadius: '0' }}></div>

            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div className="skeleton-pulse" style={{ width: '60px', height: '20px', borderRadius: '12px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '80px', height: '12px' }}></div>
                </div>

                <div className="skeleton-pulse" style={{ width: '100%', height: '18px', marginBottom: '8px' }}></div>
                <div className="skeleton-pulse" style={{ width: '70%', height: '18px', marginBottom: '20px' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div className="skeleton-pulse" style={{ width: '100%', height: '12px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '90%', height: '12px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '50%', height: '12px' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <div className="skeleton-pulse" style={{ width: '50px', height: '20px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '60px', height: '20px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '40px', height: '20px' }}></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;