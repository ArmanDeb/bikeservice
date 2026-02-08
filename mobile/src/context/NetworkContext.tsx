import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextType {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextType>({
    isConnected: null,
    isInternetReachable: null,
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setNetworkState(state);
        });

        // Initial fetch
        NetInfo.fetch().then(setNetworkState);

        return () => {
            unsubscribe();
        };
    }, []);

    const value = {
        isConnected: networkState?.isConnected ?? null,
        isInternetReachable: networkState?.isInternetReachable ?? null,
    };

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
};
