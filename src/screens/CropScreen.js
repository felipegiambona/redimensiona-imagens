import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import ImageSelector from '../components/ImageSelector';
import ImageSaveActions from '../components/ImageSaveActions';

export default function CropScreen() {
  const [images, setImages] = useState([]);
  const ratios = ['Livre', '1:1', '4:3', '16:9', '9:16 (Story)', '4:5 (Insta Post)'];

  const handleCrop = (r) => {
    if (images.length === 0) return Alert.alert('Atenção', 'Selecione uma imagem para aplicar o recorte.');
    Alert.alert('Recorte', `Aplicando proporção ${r} na imagem selecionada.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>✂️ Crop & Recorte Inteligente</Text>

      <ImageSelector images={images} setImages={setImages} allowsMultiple={false} />

      <Text style={styles.label}>Selecione a Proporção:</Text>
      {ratios.map((r, i) => (
        <TouchableOpacity key={i} style={styles.option} onPress={() => handleCrop(r)}>
          <Text style={styles.optionText}>{r}</Text>
        </TouchableOpacity>
      ))}

      {images.length > 0 && <ImageSaveActions images={images} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 15, fontWeight: 'bold', marginBottom: 15 },
  option: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  optionText: { fontSize: 15, fontWeight: '600' }
});