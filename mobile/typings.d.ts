declare module 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView' {
    import { ScrollViewProps } from 'react-native';
    import * as React from 'react';

    export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
        viewIsInsideTabBar?: boolean;
        resetScrollToCoords?: { x: number; y: number };
        enableOnAndroid?: boolean;
        enableAutomaticScroll?: boolean;
        extraScrollHeight?: number;
        extraHeight?: number;
        keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
        innerRef?: (ref: any) => void;
    }

    export default class KeyboardAwareScrollView extends React.Component<KeyboardAwareScrollViewProps> { }
}
