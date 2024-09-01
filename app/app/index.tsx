import React from "react";
import { Text, View } from "react-native";
import tw from "twrnc";

export default function Index() {
  return (
    <View style={tw`flex-1 items-center justify-center bg-white`}>
      <Text style={tw`text-3xl`}>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}

