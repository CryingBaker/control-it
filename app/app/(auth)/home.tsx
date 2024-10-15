import { Button, Text, View, FlatList, Switch, TextInput, Modal, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import '@react-native-firebase/database';
import Ionicons from 'react-native-vector-icons/Ionicons';

const signOut = async () => { 
    await auth().signOut();
    router.replace('/');
}

const Home = () => {
  const [appliances, setAppliances] = useState([]);
  const [temperature, setTemperature] = useState(null);
  const [powerConsumption, setPowerConsumption] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newApplianceName, setNewApplianceName] = useState('');
  const [newApplianceLocation, setNewApplianceLocation] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [timeSinceLastRefresh, setTimeSinceLastRefresh] = useState('Never');
  const [isToggling, setIsToggling] = useState(null);
  const [isAutomatic, setIsAutomatic] = useState(false);

  useEffect(() => {
    const fetchUserAttributes = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userId = user.uid;
          const userRef = firebase.app().database('https://control-it-38c7d-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`users/${userId}`);
          
          userRef.once('value', snapshot => {
            const userData = snapshot.val();
            if (userData) {
              setTemperature(userData.temperature || null);
              setPowerConsumption(userData.powerConsumption || null);
              setIsAutomatic(userData.automatic || false);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching user attributes from Realtime Database:", error);
      }
    };

    const fetchAppliances = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userId = user.uid;
          const appliancesRef = firebase.app().database('https://control-it-38c7d-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`users/${userId}/appliances`);
          
          appliancesRef.once('value', snapshot => {
            const appliancesList = [];
            snapshot.forEach(childSnapshot => {
              appliancesList.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
              });
            });
            setAppliances(appliancesList);
          });
        }
      } catch (error) {
        console.error("Error fetching appliances from Realtime Database:", error);
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

  const toggleAppliance = async (id) => {
    if (isToggling === id) return; // Prevent multiple toggles at the same time
    setIsToggling(id);
    try {
      const user = auth().currentUser;
      if (user) {
        const userId = user.uid;
        const applianceRef = firebase.app().database('https://control-it-38c7d-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`users/${userId}/appliances/${id}`);
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
      console.error("Error updating appliance status in Realtime Database:", error);
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
      name: newApplianceName,
      location: newApplianceLocation,
      reg_status: false,
      status: false,
    };

    try {
      const user = auth().currentUser;
      if (user) {
        const userId = user.uid;
        const applianceRef = firebase.app().database('https://control-it-38c7d-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`users/${userId}/appliances`).push();
        await applianceRef.set(newAppliance);
        setAppliances([...appliances, { id: applianceRef.key, ...newAppliance }]);
      }
    } catch (error) {
      console.error("Error adding appliance to Realtime Database:", error);
      alert(`Error adding appliance to Realtime Database: ${error.message}`);
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
        await firebase.app().database('https://control-it-38c7d-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`users/${userId}`).update({ automatic: newValue });
      }
    } catch (error) {
      console.error("Error updating automation status in Realtime Database:", error);
    }
  };

  const renderItem = ({ item }) => (
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
        <Text>No appliances found.</Text>
      )}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-5 rounded-lg shadow-lg w-80`}>
            <Text style={tw`text-lg font-bold mb-3`}>Add New Appliance</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-md p-2 mb-3`}
              placeholder="Appliance Name"
              value={newApplianceName}
              onChangeText={setNewApplianceName}
            />
            <TextInput
              style={tw`border border-gray-300 rounded-md p-2 mb-3`}
              placeholder="Location"
              value={newApplianceLocation}
              onChangeText={setNewApplianceLocation}
            />
            <View style={tw`flex-row justify-between`}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Add" onPress={addAppliance} />
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={tw`bg-red-500 rounded-lg p-3 mt-5`}
        onPress={signOut}
      >
        <Text style={tw`text-white font-bold text-center`}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;