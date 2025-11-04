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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detalhes" component={DetailsScreen} />
        <Stack.Screen name="Clientes" component={ClientesScreen} />
        <Stack.Screen name="Servicos" component={CadastroServicosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
