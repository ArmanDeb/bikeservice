import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';

// Import SVG assets
import Aprilia from '../../../assets/motobrand/aprilia.svg';
import Benelli from '../../../assets/motobrand/benelli.svg';
import BMW from '../../../assets/motobrand/bmw.svg';
import Buell from '../../../assets/motobrand/buell.svg';
import Ducati from '../../../assets/motobrand/ducati.svg';
import Harley from '../../../assets/motobrand/harley_davidson.svg';
import Honda from '../../../assets/motobrand/honda.svg';
import Husqvarna from '../../../assets/motobrand/husqvarna.svg';
import Indian from '../../../assets/motobrand/indian.svg';
import Kawasaki from '../../../assets/motobrand/kawasaki.svg';
import KTM from '../../../assets/motobrand/ktm.svg';
import MotoGuzzi from '../../../assets/motobrand/moto_guzzi.svg';
import MVAgusta from '../../../assets/motobrand/mv_agusta.svg';
import RoyalEnfield from '../../../assets/motobrand/royal_enfield.svg';
import Suzuki from '../../../assets/motobrand/suzuki.svg';
import Triumph from '../../../assets/motobrand/triumph.svg';
import Yamaha from '../../../assets/motobrand/yamaha.svg';
import { Bike } from 'lucide-react-native';

export type BrandName =
    | 'aprilia'
    | 'benelli'
    | 'bmw'
    | 'buell'
    | 'ducati'
    | 'harley-davidson'
    | 'honda'
    | 'husqvarna'
    | 'indian'
    | 'kawasaki'
    | 'ktm'
    | 'moto guzzi'
    | 'mv agusta'
    | 'royal enfield'
    | 'suzuki'
    | 'triumph'
    | 'yamaha';

interface BrandLogoProps {
    brand: string;
    variant?: 'icon' | 'watermark' | 'card';
    size?: number;
    color?: string; // Optional override for monochrome logos
    style?: StyleProp<ViewStyle>;
}

const BRAND_MAP: Record<string, React.FC<SvgProps>> = {
    'aprilia': Aprilia,
    'benelli': Benelli,
    'bmw': BMW,
    'buell': Buell,
    'ducati': Ducati,
    'harley-davidson': Harley,
    'harley': Harley, // Handle shorthand
    'honda': Honda,
    'husqvarna': Husqvarna,
    'indian': Indian,
    'kawasaki': Kawasaki,
    'ktm': KTM,
    'moto guzzi': MotoGuzzi,
    'mv agusta': MVAgusta,
    'royal enfield': RoyalEnfield,
    'suzuki': Suzuki,
    'triumph': Triumph,
    'yamaha': Yamaha,
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
    brand,
    variant = 'icon',
    size,
    color,
    style
}) => {
    // Normalize brand name: lowercase and trim
    const normalizedBrand = brand.toLowerCase().trim();
    const LogoComponent = BRAND_MAP[normalizedBrand];

    // Default sizing based on variant
    let defaultSize = 24;
    let containerStyle: ViewStyle = {};

    switch (variant) {
        case 'icon':
            defaultSize = 24;
            break;
        case 'watermark':
            defaultSize = 300;
            containerStyle = {
                opacity: 0.05, // Very subtle
                position: 'absolute',
                right: -50,
                bottom: -50,
                transform: [{ rotate: '-15deg' }],
                zIndex: -1, // Ensure it's behind content
                overflow: 'hidden' // Keep it contained within parent if parent has overflow hidden
            };
            break;
        case 'card':
            defaultSize = 48;
            break;
    }

    const finalSize = size || defaultSize;

    if (!LogoComponent) {
        // Fallback for unknown brands
        if (variant === 'watermark') return null; // Don't show generic icon for watermark

        return (
            <View style={[styles.fallbackContainer, { width: finalSize, height: finalSize }, style]}>
                <Bike size={finalSize * 0.6} color={color || '#666660'} />
            </View>
        );
    }

    return (
        <View style={[containerStyle, style]}>
            <LogoComponent
                width={finalSize}
                height={finalSize}
                fill={color} // Note: This only works if the SVG uses 'current' or doesn't have explicit colors
                style={color ? { color } as any : undefined}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    fallbackContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 999,
    }
});
