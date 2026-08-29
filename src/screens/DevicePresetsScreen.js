import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import ImageSelector from '../components/ImageSelector';
import ImageSaveActions from '../components/ImageSaveActions';

export default function DevicePresetsScreen() {
  const [images, setImages] = useState([]);
  const devices = ['Meu Celular', 'Outro Celular', 'Tablet', 'Notebook', 'Monitor 4K', 'TV Full HD'];

  const handleApply = (device) => {
    if (images.length === 0) return Alert.alert('Atenção', 'Selecione imagens para redimensionar.');
    Alert.alert('Preset Aplicado', `Redimensionando ${images.length} foto(s) para a tela de: ${device}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📱 Presets por Dispositivo</Text>

      <ImageSelector images={images} setImages={setImages} allowsMultiple={true} />

      <Text style={styles.label}>Dispositivo de destino:</Text>
      {devices.map((d, i) => (
        <TouchableOpacity key={i} style={styles.card} onPress={() => handleApply(d)}>
          <Text style={styles.cardText}>{d}</Text>
        </TouchableOpacity>
      ))}

      {images.length > 0 && <ImageSaveActions images={images} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  cardText: { fontSize: 16, fontWeight: '600' }
});