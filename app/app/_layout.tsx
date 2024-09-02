import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import {Stack, useRouter, useSegments} from 'expo-router';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

const RootLayout = () => {
  const [initializing,setInitializing] = React.useState(true);
  const [user,setUser] = React.useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();
  const segments = useSegments();
  
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("onAuthStateChanged", user);
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  },[]);

  useEffect(() => {
    if(initializing) return;
    const inAuthGroup = segments[0] === '(auth)';
    if(user && !inAuthGroup) router.replace({ pathname: '/(auth)/home' });
    if(!user && inAuthGroup) router.replace('/');
  },[user,initializing]);

  if (initializing)
    return(
      <View
        style={{alignItems: 'center', justifyContent: 'center', flex: 1

        }}>
      <ActivityIndicator size="large"/>
      </View>
    )
    return (
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name='(auth)' options={{headerShown: false}}/>
      </Stack>
    )
}

export default RootLayout
