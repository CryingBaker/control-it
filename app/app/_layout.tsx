import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {Stack} from 'expo-router';
import { firebase } from '@react-native-firebase/auth';

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index"/>
    </Stack>
  )
}

export default RootLayout
