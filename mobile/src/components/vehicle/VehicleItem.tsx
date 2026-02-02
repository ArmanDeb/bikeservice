import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
// import { withObservables } from '@nozbe/watermelondb/react'
import Vehicle from '../../database/models/Vehicle'

interface Props {
    vehicle: Vehicle
    onPress: (vehicle: Vehicle) => void
}

const VehicleItem = ({ vehicle, onPress }: Props) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(vehicle)}
            className="bg-surface p-4 rounded-xl mb-4 border border-border"
        >
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-xl font-bold text-text">{vehicle.brand} {vehicle.model}</Text>
                    <Text className="text-text-secondary text-sm">
                        {vehicle.year ? `${vehicle.year}` : ''}
                        {vehicle.year && vehicle.vin ? ' • ' : ''}
                        {vehicle.vin ? vehicle.vin : ''}
                    </Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-primary-dark font-bold">{vehicle.currentMileage.toLocaleString()} km</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

// const enhance = withObservables(['vehicle'], ({ vehicle }) => ({
//     vehicle,
// }))

export default VehicleItem
