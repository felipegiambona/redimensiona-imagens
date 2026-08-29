import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import ImageSelector from '../components/ImageSelector';
import ImageSaveActions from '../components/ImageSaveActions';

export default function BatchProcessScreen() {
  const [images, setImages] = useState([]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Processamento em Lote</Text>
      <Text style={styles.desc}>Selecione várias imagens para otimizar, converter e renomear simultaneamente.</Text>
      
      <ImageSelector images={images} setImages={setImages} allowsMultiple={true} />

      {images.length > 0 && (
        <>
          <TouchableOpacity style={styles.btn} onPress={() => Alert.alert('Lote', `Iniciando processamento em lote de ${images.length} fotos.`)}>
            <Text style={styles.btnText}>Executar Processamento em Lote</Text>
          </TouchableOpacity>
          <ImageSaveActions images={images} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  desc: { color: '#666', marginBottom: 20 },
  btn: { backgroundColor: '#007aff', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});