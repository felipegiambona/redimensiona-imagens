import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import ImageSelector from '../components/ImageSelector';

export default function PrintCalculatorScreen() {
  const [images, setImages] = useState([]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🖨️ Calculadora de Impressão</Text>
      
      <ImageSelector images={images} setImages={setImages} allowsMultiple={false} />

      {images.length > 0 ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Análise da Imagem Selecionada:</Text>
          <Text style={styles.resultText}>Largura/Altura: {images[0].width} × {images[0].height} px</Text>
          <Text style={styles.resultText}>Tamanho recomendado para impressão em 300 DPI:</Text>
          <Text style={styles.pixelText}>
            {((images[0].width / 300) * 2.54).toFixed(1)} x {((images[0].height / 300) * 2.54).toFixed(1)} cm
          </Text>
        </View>
      ) : (
        <Text style={styles.info}>Selecione uma foto para calcular o tamanho físico ideal de impressão.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  info: { color: '#666', fontSize: 15 },
  resultBox: { backgroundColor: '#e7f5ff', padding: 20, borderRadius: 12 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#1864ab', marginBottom: 8 },
  resultText: { fontSize: 14, color: '#1c7ed6', marginBottom: 4 },
  pixelText: { fontSize: 20, fontWeight: 'bold', color: '#1864ab', marginTop: 10 }
});