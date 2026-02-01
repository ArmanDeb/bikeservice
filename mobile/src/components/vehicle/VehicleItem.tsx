import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react'
import Vehicle from '../../database/models/Vehicle'

interface Props {
    vehicle: Vehicle
    onPress: (vehicle: Vehicle) => void
}

const VehicleItem = ({ vehicle, onPress }: Props) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(vehicle)}
            className="bg-neutral-800 p-4 rounded-xl mb-4 border border-neutral-700 active:scale-95 transition-transform"
        >
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-xl font-bold text-white">{vehicle.brand} {vehicle.model}</Text>
                    <Text className="text-neutral-400 text-sm">
                        {vehicle.year ? `${vehicle.year}` : ''}
                        {vehicle.year && vehicle.vin ? ' • ' : ''}
                        {vehicle.vin ? vehicle.vin : ''}
                    </Text>
                </View>
                <View className="bg-yellow-500/10 px-3 py-1 rounded-full">
                    <Text className="text-yellow-500 font-bold">{vehicle.currentMileage.toLocaleString()} km</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const enhance = withObservables(['vehicle'], ({ vehicle }) => ({
    vehicle,
}))

export default enhance(VehicleItem)
