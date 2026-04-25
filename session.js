// Session Management
async function getSession() {
    const userId = await window.electronAPI.storeGet('userId');
    const session = await window.electronAPI.storeGet('session');
    return { userId, session };
}

async function isLoggedIn() {
    const userId = await window.electronAPI.storeGet('userId');
    const session = await window.electronAPI.storeGet('session');
    return !!(userId && session);
}

async function logout() {
    await window.electronAPI.storeDelete('userId');
    await window.electronAPI.storeDelete('session');
    await window.electronAPI.storeDelete('isLoggedIn');
    window.electronAPI.navigate('login');
}