export function isTVDevice() {
    const ua = navigator.userAgent.toLowerCase();
    return (
        ua.includes("aft") || // Amazon Fire Tablet/TV (like AFTT, AFTS, AFTMM, etc.)
        ua.includes("amazonwebappplatform") || // Seen in some Fire OS devices
        ua.includes("fire os") || // Some include this string
        (ua.includes("android") && ua.includes("silk")) // Silk browser (Fire TV uses Silk)
    );
}