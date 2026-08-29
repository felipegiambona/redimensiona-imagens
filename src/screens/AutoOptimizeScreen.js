import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import ImageSelector from '../components/ImageSelector';
import ImageSaveActions from '../components/ImageSaveActions';

export default function AutoOptimizeScreen() {
  const [images, setImages] = useState([]);

  const handleOptimize = (option) => {
    if (images.length === 0) return Alert.alert('Atenção', 'Selecione pelo menos uma imagem.');
    Alert.alert('Sucesso', `Otimizando ${images.length} imagem(ns) para: ${option}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>⚡ Otimização Automática</Text>
      <Text style={styles.desc}>Escolha o destino final e o app ajustará resolução, formato e corte.</Text>

      <ImageSelector images={images} setImages={setImages} allowsMultiple={true} />

      <Text style={styles.subtitle}>Qual o destino final?</Text>
      {['📱 Usar no celular', '🌐 Usar na web', '📱 Redes sociais', '🖨️ Imprimir', '📦 Economizar espaço'].map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.cardOption} onPress={() => handleOptimize(item)}>
          <Text style={styles.cardOptionText}>{item}</Text>
        </TouchableOpacity>
      ))}

      {images.length > 0 && <ImageSaveActions images={images} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  desc: { color: '#666', marginBottom: 20 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  cardOption: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  cardOptionText: { fontSize: 16, fontWeight: '600', color: '#333' }
});