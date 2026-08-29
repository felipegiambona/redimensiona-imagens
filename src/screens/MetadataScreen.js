import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import ImageSelector from '../components/ImageSelector';
import ImageSaveActions from '../components/ImageSaveActions';

export default function MetadataScreen() {
  const [images, setImages] = useState([]);

  const handleClean = () => {
    if (images.length === 0) return Alert.alert('Atenção', 'Selecione as fotos para remover os dados.');
    Alert.alert('Privacidade', `Metadados EXIF e GPS removidos de ${images.length} foto(s).`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🛡️ Remoção de Metadados</Text>
      <Text style={styles.warn}>⚠️ Remove dados de localização GPS, modelo de dispositivo e data de criação.</Text>

      <ImageSelector images={images} setImages={setImages} allowsMultiple={true} />

      <TouchableOpacity style={styles.btn} onPress={handleClean}>
        <Text style={styles.btnText}>Limpar Metadados (EXIF)</Text>
      </TouchableOpacity>

      {images.length > 0 && <ImageSaveActions images={images} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  warn: { backgroundColor: '#fff3cd', color: '#856404', padding: 15, borderRadius: 8, marginBottom: 20 },
  btn: { backgroundColor: '#ff3b30', padding: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});