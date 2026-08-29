import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import AutoOptimizeScreen from './src/screens/AutoOptimizeScreen';
import CompressScreen from './src/screens/CompressScreen';
import ConvertScreen from './src/screens/ConvertScreen';
import CropScreen from './src/screens/CropScreen';
import BatchProcessScreen from './src/screens/BatchProcessScreen';
import MetadataScreen from './src/screens/MetadataScreen';
import PrintCalculatorScreen from './src/screens/PrintCalculatorScreen';
import AspectRatioScreen from './src/screens/AspectRatioScreen';
import ImageInfoScreen from './src/screens/ImageInfoScreen';
import DevicePresetsScreen from './src/screens/DevicePresetsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#0B0914' },
          headerTintColor: '#8A5CF5',
          headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AutoOptimize" component={AutoOptimizeScreen} options={{ title: 'Otimização Automática' }} />
        <Stack.Screen name="Compress" component={CompressScreen} options={{ title: 'Compressão' }} />
        <Stack.Screen name="Convert" component={ConvertScreen} options={{ title: 'Conversor' }} />
        <Stack.Screen name="Crop" component={CropScreen} options={{ title: 'Crop & Recorte' }} />
        <Stack.Screen name="BatchProcess" component={BatchProcessScreen} options={{ title: 'Em Lote' }} />
        <Stack.Screen name="Metadata" component={MetadataScreen} options={{ title: 'Privacidade & EXIF' }} />
        <Stack.Screen name="PrintCalculator" component={PrintCalculatorScreen} options={{ title: 'Impressão' }} />
        <Stack.Screen name="AspectRatio" component={AspectRatioScreen} options={{ title: 'Proporção' }} />
        <Stack.Screen name="ImageInfo" component={ImageInfoScreen} options={{ title: 'Informações' }} />
        <Stack.Screen name="DevicePresets" component={DevicePresetsScreen} options={{ title: 'Dispositivos' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}