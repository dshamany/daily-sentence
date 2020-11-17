import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, unstable_batchedUpdates, View } from 'react-native';

import Viewer from './components/Viewer'

export default function App() {

  return (
    <View style={styles.container}>
      <Viewer />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});
