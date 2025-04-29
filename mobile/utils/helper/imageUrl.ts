export type ImagePreset = 'sm' | 'md' | 'lg';

export const PresetSizes = {
    sm: '400',
    md: '800',
    lg: '1200',
};

export const getImageUriWithPreset = (uri?: string, preset: ImagePreset = 'md') => {
    if (!uri) {
        return '';
    }
    if (!uri.startsWith('https://images.shogun.social')) {
        return uri;
    }
    const urlObj = new URL(uri);
    const searchParams = urlObj.searchParams;
    if (!searchParams.has('o')) {
        searchParams.set('o', 'avif');
    }
    if (!searchParams.has('q')) {
        searchParams.set('q', '0.95');
    }
    if (!searchParams.has('w') && !searchParams.has('h')) {
        searchParams.set('w', PresetSizes[preset]);
        searchParams.set('h', PresetSizes[preset]);
    }
    return urlObj.toString();
};
