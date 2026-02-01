import React, { createContext, useContext, useState, useEffect } from 'react'
import { Model } from '@nozbe/watermelondb'

interface VehicleContextType {
    selectedVehicleId: string | null
    setSelectedVehicleId: (id: string | null) => void
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined)

export function VehicleProvider({ children }: { children: React.ReactNode }) {
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

    return (
        <VehicleContext.Provider value={{ selectedVehicleId, setSelectedVehicleId }}>
            {children}
        </VehicleContext.Provider>
    )
}

export function useVehicle() {
    const context = useContext(VehicleContext)
    if (context === undefined) {
        throw new Error('useVehicle must be used within a VehicleProvider')
    }
    return context
}
