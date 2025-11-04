import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import ClientesScreen from './screens/clientes';
import CadastroServicosScreen from './screens/servicos';

import { initDatabase } from './database/setup';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Detalhes" component={DetailsScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Clientes" component={ClientesScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Servicos" component={CadastroServicosScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
