import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import ImageSelector from '../components/ImageSelector';
import ImageSaveActions from '../components/ImageSaveActions';

export default function CompressScreen() {
  const [images, setImages] = useState([]);
  const [quality, setQuality] = useState('80%');
  const [targetSize, setTargetSize] = useState('500');

  const handleCompress = () => {
    if (images.length === 0) return Alert.alert('Atenção', 'Selecione imagens antes de comprimir.');
    Alert.alert('Processando', `Comprimindo ${images.length} imagem(ns) para ~${targetSize} KB com qualidade em ${quality}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🗜️ Compressão de Imagens</Text>
      
      <ImageSelector images={images} setImages={setImages} allowsMultiple={true} />

      <Text style={styles.label}>Nível de Qualidade</Text>
      <View style={styles.row}>
        {['100%', '80%', '50%'].map((q) => (
          <TouchableOpacity 
            key={q} 
            style={[styles.chip, quality === q && styles.chipActive]} 
            onPress={() => setQuality(q)}
          >
            <Text style={[styles.chipText, quality === q && styles.chipTextActive]}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tamanho máximo desejado (KB)</Text>
      <TextInput style={styles.input} value={targetSize} onChangeText={setTargetSize} keyboardType="numeric" />

      <TouchableOpacity style={styles.btnProcess} onPress={handleCompress}>
        <Text style={styles.btnText}>Processar Compressão</Text>
      </TouchableOpacity>

      {images.length > 0 && <ImageSaveActions images={images} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 15, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 15 },
  chip: { padding: 12, backgroundColor: '#e9ecef', borderRadius: 8, marginRight: 10, flex: 1, alignItems: 'center' },
  chipActive: { backgroundColor: '#007aff' },
  chipText: { fontWeight: '600', color: '#333' },
  chipTextActive: { color: '#fff' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  btnProcess: { backgroundColor: '#007aff', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});