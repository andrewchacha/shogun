import React, {useState} from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import Text from '@/components/Text/Text';
import {spacing} from '@/utils/styles';

interface Props {
    onSearch: (query: string) => void;
    onFilterPress?: () => void;
    placeholder?: string;
    showFilters?: boolean;
    activeFiltersCount?: number;
}

export const Search = ({
    onSearch,
    onFilterPress,
    placeholder = 'Search circles...',
    showFilters = true,
    activeFiltersCount = 0,
}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        onSearch(text);
    };

    const clearSearch = () => {
        setSearchQuery('');
        onSearch('');
    };

    return (
        <View style={styles.container}>
            <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
                {/* Search Icon */}
                <Ionicons name="search" size={20} color={isFocused ? '#8B45FF' : '#8B8B8B'} style={styles.searchIcon} />

                {/* Search Input */}
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    placeholderTextColor="#8B8B8B"
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {/* Clear Button */}
                {searchQuery.length > 0 && (
                    <TouchableOpacity style={styles.clearButton} onPress={clearSearch} activeOpacity={0.7}>
                        <Ionicons name="close-circle" size={20} color="#8B8B8B" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Button */}
            {showFilters && (
                <TouchableOpacity
                    style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
                    onPress={onFilterPress}
                    activeOpacity={0.8}>
                    <Ionicons name="filter" size={20} color={activeFiltersCount > 0 ? '#FFFFFF' : '#8B8B8B'} />
                    {activeFiltersCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            gap: 12,
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.cardVariants.tag.backgroundColor,
            borderRadius: spacing.l,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: 'transparent',
        },
        searchContainerFocused: {
            borderColor: theme.colors.primary,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '400',
            paddingVertical: 0,
        },
        clearButton: {
            padding: 4,
            marginLeft: 8,
        },
        filterButton: {
            position: 'relative',
            backgroundColor: theme.cardVariants.tag.backgroundColor,
            borderRadius: spacing.l,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        filterButtonActive: {
            borderColor: theme.colors.primary,
        },
        filterBadge: {
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#FF4444',
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
        },
        filterBadgeText: {
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
        },
    });
