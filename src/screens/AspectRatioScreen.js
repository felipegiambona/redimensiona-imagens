import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import ImageSelector from '../components/ImageSelector';

export default function AspectRatioScreen() {
  const [images, setImages] = useState([]);

  const img = images[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📐 Calculadora de Proporção</Text>

      <ImageSelector images={images} setImages={setImages} allowsMultiple={false} />

      {img ? (
        <View style={styles.result}>
          <Text style={styles.resLabel}>Dimensões Originais:</Text>
          <Text style={styles.resValue}>{img.width} × {img.height} px</Text>
          <Text style={[styles.resLabel, { marginTop: 15 }]}>Proporção calculada:</Text>
          <Text style={styles.resValue}>{(img.width / img.height).toFixed(2)}:1</Text>
        </View>
      ) : (
        <Text style={{ color: '#666' }}>Selecione uma imagem para analisar o Aspect Ratio.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  result: { padding: 20, backgroundColor: '#f8f9fa', borderRadius: 10, alignItems: 'center' },
  resLabel: { color: '#666', fontSize: 14 },
  resValue: { fontSize: 22, fontWeight: 'bold', color: '#007aff', marginTop: 4 }
});