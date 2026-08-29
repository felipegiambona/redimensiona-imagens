import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import ImageSelector from '../components/ImageSelector';
import ImageSaveActions from '../components/ImageSaveActions';

export default function ConvertScreen() {
  const [images, setImages] = useState([]);
  const [format, setFormat] = useState('WebP');
  const formats = ['JPG', 'PNG', 'WebP', 'AVIF', 'HEIC', 'GIF'];

  const handleConvert = () => {
    if (images.length === 0) return Alert.alert('Atenção', 'Selecione imagens para converter.');
    Alert.alert('Sucesso', `Convertendo ${images.length} arquivo(s) para formato ${format}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔄 Conversor de Formatos</Text>

      <ImageSelector images={images} setImages={setImages} allowsMultiple={true} />

      <Text style={styles.label}>Selecione o formato de saída:</Text>
      <View style={styles.grid}>
        {formats.map((fmt) => (
          <TouchableOpacity 
            key={fmt} 
            style={[styles.gridItem, format === fmt && styles.gridItemActive]} 
            onPress={() => setFormat(fmt)}
          >
            <Text style={[styles.gridText, format === fmt && styles.gridTextActive]}>{fmt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnConvert} onPress={handleConvert}>
        <Text style={styles.btnText}>Converter Imagens</Text>
      </TouchableOpacity>

      {images.length > 0 && <ImageSaveActions images={images} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 15, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginBottom: 12 },
  gridItemActive: { backgroundColor: '#007aff', borderColor: '#007aff' },
  gridText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  gridTextActive: { color: '#fff' },
  btnConvert: { backgroundColor: '#007aff', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});