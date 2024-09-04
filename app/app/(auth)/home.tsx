import { Button, Text, View, FlatList, Switch, TextInput, Modal, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';

const signOut = async () => { 
    await auth().signOut();
    router.replace('/');
}

const Home = () => {
  const [appliances, setAppliances] = useState<{ id: string; name: string; status: boolean; reg_status: boolean; }[]>([]);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [powerConsumption, setPowerConsumption] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newApplianceName, setNewApplianceName] = useState('');
  const [newApplianceLocation, setNewApplianceLocation] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [timeSinceLastRefresh, setTimeSinceLastRefresh] = useState<string>('Never');
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isAutomatic, setIsAutomatic] = useState(false);

  useEffect(() => {
    const fetchUserAttributes = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userId = user.uid;
          const userDoc = await firestore().collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setTemperature(userData?.temperature || null);
            setPowerConsumption(userData?.powerConsumption || null);
            setIsAutomatic(userData?.automatic || false);
          }
        }
      } catch (error) {
        console.error("Error fetching user attributes from Firestore:", error);
      }
    };

    const fetchAppliances = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userId = user.uid;
          const appliancesSnapshot = await firestore().collection('users').doc(userId).collection('appliances').get();
          const appliancesList: { id: string; name: string; status: boolean; reg_status: boolean; }[] = appliancesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, status: doc.data().status, reg_status: doc.data().reg_status }));
          setAppliances(appliancesList);
        }
      } catch (error) {
        console.error("Error fetching appliances from Firestore:", error);
      }
    };

    const fetchData = () => {
      fetchUserAttributes();
      fetchAppliances();
      setLastRefreshTime(new Date());
    };

    fetchData(); // Initial fetch

    const fetchIntervalId = setInterval(fetchData, 8000); // Fetch data every 8 seconds

    return () => {
      clearInterval(fetchIntervalId); // Clear fetch interval on component unmount
    };
  }, []);

  useEffect(() => {
    const updateRefreshTime = () => {
      if (!lastRefreshTime) {
        setTimeSinceLastRefresh('Never');
        return;
      }
      const now = new Date();
      const seconds = Math.floor((now.getTime() - lastRefreshTime.getTime()) / 1000);
      setTimeSinceLastRefresh(`${seconds} seconds ago`);
    };

    const refreshTimeIntervalId = setInterval(updateRefreshTime, 1000); // Update time since last refresh every second

    return () => {
      clearInterval(refreshTimeIntervalId); // Clear refresh time interval on component unmount
    };
  }, [lastRefreshTime]);

  const toggleAppliance = async (id: string) => {
    if (isToggling === id) return; // Prevent multiple toggles at the same time
    setIsToggling(id);
    try {
      const user = auth().currentUser;
      if (user) {
        const userId = user.uid;
        const applianceRef = firestore().collection('users').doc(userId).collection('appliances').doc(id);
        const appliance = appliances.find(appliance => appliance.id === id);
        if (appliance) {
          const newStatus = !appliance.status;
          await applianceRef.update({ status: newStatus });
          setAppliances(prevAppliances =>
            prevAppliances.map(appliance =>
              appliance.id === id ? { ...appliance, status: newStatus } : appliance
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating appliance status in Firestore:", error);
    } finally {
      setIsToggling(null);
    }
  };

  const addAppliance = async () => {
    if (newApplianceName.trim() === '' || newApplianceLocation.trim() === '') {
      alert('Please enter valid appliance details.');
      return;
    }

    const newAppliance = {
      id: (appliances.length + 1).toString(),
      name: newApplianceName,
      location: newApplianceLocation,
      reg_status: false,
      status: false,
    };

    try {
      const user = auth().currentUser;
      if (user) {
        const userId = user.uid;
        const applianceRef = firestore().collection('users').doc(userId).collection('appliances').doc(newAppliance.id);
        await applianceRef.set(newAppliance);
        setAppliances([...appliances, newAppliance]);
      }
    } catch (error) {
      console.error("Error adding appliance to Firestore:", error);
      alert(`Error adding appliance to Firestore: ${(error as Error).message}`);
    }

    setNewApplianceName('');
    setNewApplianceLocation('');
    setModalVisible(false);
  };

  const toggleAutomation = async () => {
    const newValue = !isAutomatic;
    setIsAutomatic(newValue);
    try {
      const user = auth().currentUser;
      if (user) {
        const userId = user.uid;
        await firestore().collection('users').doc(userId).update({ automatic: newValue });
      }
    } catch (error) {
      console.error("Error updating automation status in Firestore:", error);
    }
  };

  const renderItem = ({ item }: { item: { id: string, name: string, status: boolean, reg_status: boolean } }) => (
    <View style={tw`flex-row justify-between items-center p-4 mb-2 rounded-lg shadow ${item.reg_status ? 'bg-white' : 'bg-gray-200'}`}>
      <View>
        <Text style={tw`text-lg ${item.reg_status ? 'text-black' : 'text-gray-500'}`}>{item.name}</Text>
        {!item.reg_status && <Text style={tw`text-yellow-500`}>Pending Configuration</Text>}
      </View>
      <Switch
        value={item.status}
        onValueChange={() => toggleAppliance(item.id)}
        disabled={!item.reg_status || isToggling === item.id || isAutomatic}
      />
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 p-5 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-5`}>Home</Text>
      <View style={tw`flex-row justify-between mb-5`}>
        <View style={tw`flex-1 mr-2 p-4 bg-white rounded-lg shadow`}>
          <Text style={tw`text-lg font-bold`}>Current Temperature</Text>
          <Text style={tw`text-2xl`}>{temperature !== null ? `${temperature}°C` : 'Loading...'}</Text>
        </View>
        <View style={tw`flex-1 ml-2 p-4 bg-white rounded-lg shadow`}>
          <Text style={tw`text-lg font-bold`}>Power Consumption</Text>
          <Text style={tw`text-2xl`}>{powerConsumption !== null ? `${powerConsumption}W` : 'Loading...'}</Text>
        </View>
      </View>
      <Text style={tw`text-sm mb-5`}>Last Refresh: {timeSinceLastRefresh}</Text>
      <View style={tw`flex-row justify-between items-center mb-5`}>
        <Text style={tw`text-xl font-bold`}>Your Appliances</Text>
        <View style={tw`flex-row`}>
          <TouchableOpacity onPress={toggleAutomation} style={tw`mr-2 p-2 rounded-full ${isAutomatic ? 'bg-green-500' : 'bg-red-500'}`}>
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={tw`bg-blue-500 rounded-full p-2`}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      {appliances.length > 0 ? (
        <FlatList
          data={appliances}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={tw`text-lg`}>No appliances found.</Text>
      )}
      <TouchableOpacity
        style={tw`bg-red-500 rounded-lg p-3 mt-5`}
        onPress={signOut}
      >
        <Text style={tw`text-white font-bold text-center`}>Sign Out</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`w-4/5 bg-white rounded-2xl p-5 shadow-lg`}>
            <Text style={tw`text-xl font-bold mb-4`}>Add New Appliance</Text>
            <TextInput
              style={tw`h-10 border border-gray-300 rounded-lg mb-4 px-3 bg-white`}
              placeholder="Appliance Name"
              value={newApplianceName}
              onChangeText={setNewApplianceName}
            />
            <TextInput
              style={tw`h-10 border border-gray-300 rounded-lg mb-4 px-3 bg-white`}
              placeholder="Location"
              value={newApplianceLocation}
              onChangeText={setNewApplianceLocation}
            />
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                style={tw`bg-red-500 rounded-lg p-3`}
                onPress={() => setModalVisible(false)}
              >
                <Text style={tw`text-white font-bold text-center`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-blue-500 rounded-lg p-3`}
                onPress={addAppliance}
              >
                <Text style={tw`text-white font-bold text-center`}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;