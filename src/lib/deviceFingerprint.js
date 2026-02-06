// Device fingerprinting utility
// Collects browser, device, and hardware info for security logging

export async function collectDeviceInfo() {
    const info = {};

    // Basic browser info
    info.user_agent = navigator.userAgent;
    info.platform = navigator.platform || navigator.userAgentData?.platform || 'unknown';
    info.language = navigator.language || navigator.userLanguage || 'unknown';
    info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
    info.screen_resolution = `${window.screen.width}x${window.screen.height}`;
    info.color_depth = window.screen.colorDepth;
    info.is_touch_device = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    info.max_touch_points = navigator.maxTouchPoints || 0;
    info.device_memory = navigator.deviceMemory || null;
    info.hardware_concurrency = navigator.hardwareConcurrency || null;

    // Parse browser name and version
    const ua = navigator.userAgent;
    info.browser = parseBrowser(ua);
    info.browser_version = parseBrowserVersion(ua);
    info.os = parseOS(ua);
    info.device_type = detectDeviceType();

    // Connection type
    if (navigator.connection) {
        info.connection_type = navigator.connection.effectiveType || navigator.connection.type || 'unknown';
    } else {
        info.connection_type = 'unknown';
    }

    // Referrer
    info.referrer = document.referrer || 'direct';

    // WebGL info (GPU fingerprint)
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                info.webgl_renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
                info.webgl_vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
            }
        }
    } catch {
        info.webgl_renderer = 'unavailable';
        info.webgl_vendor = 'unavailable';
    }

    // Canvas fingerprint hash
    try {
        info.fingerprint = await generateCanvasFingerprint();
    } catch {
        info.fingerprint = 'unavailable';
    }

    // Get IP address from public API
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
        const ipData = await ipRes.json();
        info.ip_address = ipData.ip;
    } catch {
        info.ip_address = 'unavailable';
    }

    return info;
}

function parseBrowser(ua) {
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    return 'Unknown';
}

function parseBrowserVersion(ua) {
    const match = ua.match(/(Firefox|Edg|OPR|Chrome|Safari|Opera)\/(\d+[\.\d]*)/);
    return match ? match[2] : 'unknown';
}

function parseOS(ua) {
    if (ua.includes('Windows NT 10')) return 'Windows 10/11';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
}

function detectDeviceType() {
    const ua = navigator.userAgent;
    if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) return 'mobile';
    if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return 'tablet';
    return 'desktop';
}

async function generateCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');

    // Draw unique text with various styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Lunar fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Lunar fingerprint', 4, 17);

    // Convert to data URL and hash it
    const dataUrl = canvas.toDataURL();
    const hash = await simpleHash(dataUrl);
    return hash;
}

async function simpleHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
