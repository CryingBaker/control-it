import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator, Platform } from 'react-native';
import tw from 'twrnc';
import auth, { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


// if (Platform.OS === 'web') {
//   const firebaseConfig = require('./firebaseConfig'); // Replace './firebaseConfig' with the path to your actual firebase config file
//   if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig);
//   } else {
//     firebase.app(); // if already initialized, use that one
//   }
// }

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      alert("Signed in!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      // Set initial temperature and powerConsumption in Firestore
      await firestore().collection('users').doc(userId).set({
        temperature: "0",
        powerConsumption: "0",
      });

      alert("Check your email!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-100`}>
      <KeyboardAvoidingView behavior="padding" style={tw`w-10/12`}>
        <Text style={tw`text-2xl font-bold mb-6 text-center`}>Sign In</Text>

        <Text style={tw`text-sm font-semibold mb-2`}>Email</Text>
        <TextInput
          style={tw`border-b border-gray-400 w-full p-3 mb-4 rounded-lg bg-white shadow-sm`}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={tw`text-sm font-semibold mb-2`}>Password</Text>
        <TextInput
          style={tw`border-b border-gray-400 w-full p-3 mb-6 rounded-lg bg-white shadow-sm`}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <>
            <TouchableOpacity
              style={tw`w-full bg-blue-600 p-3 rounded-lg mb-4`}
              onPress={signIn}
            >
              <Text style={tw`text-white text-center text-lg`}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`w-full bg-blue-600 p-3 rounded-lg`}
              onPress={signUp}
            >
              <Text style={tw`text-white text-center text-lg`}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

export default App;