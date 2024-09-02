import { Button, StyleSheet, Text, View, FlatList, Switch } from 'react-native';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock functions to get temperature and power consumption
const getCurrentTemperature = async () => {
  // Replace with actual API call
  return 25; // Example temperature in Celsius
};

const getTotalPowerConsumption = async () => {
  // Replace with actual API call
  return 1500; // Example power consumption in Watts
};

const signOut = async () => { 
    await auth().signOut();
    router.replace('/');
}

const appliancesData = [
  { id: '1', name: 'Air Conditioner', status: false },
  { id: '2', name: 'Heater', status: false },
  { id: '3', name: 'Lights', status: false },
  { id: '4', name: 'Fan', status: false },
];

const Home = () => {
  const [appliances, setAppliances] = useState(appliancesData);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [powerConsumption, setPowerConsumption] = useState<number | null>(null);

  useEffect(() => {
    const fetchTemperatureAndPower = async () => {
      const temp = await getCurrentTemperature();
      const power = await getTotalPowerConsumption();
      setTemperature(temp);
      setPowerConsumption(power);
    };

    fetchTemperatureAndPower();
  }, []);

  const toggleAppliance = (id: string) => {
    setAppliances(prevAppliances =>
      prevAppliances.map(appliance =>
        appliance.id === id ? { ...appliance, status: !appliance.status } : appliance
      )
    );
  };

  const renderItem = ({ item }: { item: { id: string, name: string, status: boolean } }) => (
    <View style={styles.applianceContainer}>
      <Text style={styles.applianceName}>{item.name}</Text>
      <Switch
        value={item.status}
        onValueChange={() => toggleAppliance(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.infoText}>Current Temperature: {temperature !== null ? `${temperature}°C` : 'Loading...'}</Text>
      <Text style={styles.infoText}>Total Power Consumption: {powerConsumption !== null ? `${powerConsumption}W` : 'Loading...'}</Text>
      <FlatList
        data={appliances}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <Button title="Sign Out" onPress={signOut} />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
  },
  applianceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  applianceName: {
    fontSize: 18,
  },
});