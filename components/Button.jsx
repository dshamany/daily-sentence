import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function Button({ title, onPress, style, titleStyle }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={{
                ...styles.main,
            }, { ...style }}>
                <Text style={titleStyle ? titleStyle : { color: "#555" }}>{title ? title : "Button"}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    main: {
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        width: 100,
        height: 40,
        borderRadius: 5,
        margin: 3

    }
});