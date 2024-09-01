import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import auth from '@react-native-firebase/auth';

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
    };
  };

  const signUp = async () => {
    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
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
          autoCapitalize="none" />

        <Text style={tw`text-sm font-semibold mb-2`}>Password</Text>
        <TextInput
          style={tw`border-b border-gray-400 w-full p-3 mb-6 rounded-lg bg-white shadow-sm`}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry />
        {loading ? (
          <ActivityIndicator size={"small"} />
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