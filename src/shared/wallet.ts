export const connectWallet = async (tgId: string, wallet: string) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    console.log('🚀 Connecting wallet to:', BACKEND_URL);
    console.log('📤 Sending data:', { tgId, wallet });
    
    const res = await fetch(`${BACKEND_URL}/api/connect-wallet`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tgId, wallet })
    })

    console.log('📥 Response status:', res.status);

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Request failed:', errorData);
        throw new Error('Failed to connect wallet');
    }

    const data = await res.json();
    console.log('✅ Success:', data);
    return data;
}