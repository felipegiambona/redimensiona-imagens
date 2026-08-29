import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import ImageSelector from '../components/ImageSelector';

export default function ImageInfoScreen() {
  const [images, setImages] = useState([]);
  const img = images[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ℹ️ Inspetor de Informações</Text>
      
      <ImageSelector images={images} setImages={setImages} allowsMultiple={false} />

      {img && (
        <View style={styles.infoBox}>
          <Text style={styles.infoItem}><strong>Resolução:</strong> {img.width} × {img.height} px</Text>
          <Text style={styles.infoItem}><strong>Tipo:</strong> {img.type || 'Imagem'}</Text>
          <Text style={styles.infoItem}><strong>URI Local:</strong> {img.uri}</Text>
          {img.fileSize && <Text style={styles.infoItem}><strong>Tamanho:</strong> {(img.fileSize / (1024 * 1024)).toFixed(2)} MB</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  infoBox: { backgroundColor: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  infoItem: { fontSize: 15, marginBottom: 8, color: '#333' }
});