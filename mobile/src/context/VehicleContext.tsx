import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { database } from '../database'
import { TableName } from '../database/constants'
import Vehicle from '../database/models/Vehicle'

interface VehicleContextType {
    selectedVehicleId: string | null
    setSelectedVehicleId: (id: string | null) => void
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined)

const STORAGE_KEY = 'selected_vehicle_id'

export function VehicleProvider({ children }: { children: React.ReactNode }) {
    const [selectedVehicleId, setSelectedVehicleIdState] = useState<string | null>(null)

    // Load persisted selection
    useEffect(() => {
        const loadSelection = async () => {
            try {
                const savedId = await AsyncStorage.getItem(STORAGE_KEY)
                if (savedId) {
                    setSelectedVehicleIdState(savedId)
                } else {
                    // If no saved selection, pick the first available vehicle
                    const vehicles = await database.get<Vehicle>(TableName.VEHICLES).query().fetch()
                    if (vehicles.length > 0) {
                        setSelectedVehicleIdState(vehicles[0].id)
                    }
                }
            } catch (e) {
                console.error('Failed to load selected vehicle:', e)
            }
        }
        loadSelection()
    }, [])

    const setSelectedVehicleId = async (id: string | null) => {
        setSelectedVehicleIdState(id)
        try {
            if (id) {
                await AsyncStorage.setItem(STORAGE_KEY, id)
            } else {
                await AsyncStorage.removeItem(STORAGE_KEY)
            }
        } catch (e) {
            console.error('Failed to save selected vehicle:', e)
        }
    }

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
