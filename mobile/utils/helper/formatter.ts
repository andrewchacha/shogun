export function hideMiddle(text: string, length: number = 5) {
    if (text.length < length * 2) {
        return text;
    }
    return text.slice(0, length) + '...' + text.slice(-length);
}

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
