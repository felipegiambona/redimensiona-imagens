import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
// Importação atualizada para a API legada do Expo FileSystem
import * as FileSystem from 'expo-file-system/legacy';

export default function ImageSaveActions({ images }) {
  const [loading, setLoading] = useState(false);

  const saveToGallery = async () => {
    if (!images || images.length === 0) {
      Alert.alert('Atenção', 'Nenhuma imagem selecionada para salvar.');
      return;
    }

    setLoading(true);

    try {
      // Solicita permissão apenas de gravação
      const permission = await MediaLibrary.requestPermissionsAsync(true);

      if (permission.status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessária permissão para salvar fotos na galeria.');
        setLoading(false);
        return;
      }

      for (const img of images) {
        const filename = img.uri.split('/').pop() || `image_${Date.now()}.jpg`;
        const targetPath = `${FileSystem.documentDirectory}${filename}`;

        // Copia o arquivo da URI para o diretório de documentos do app
        await FileSystem.copyAsync({
          from: img.uri,
          to: targetPath,
        });

        // Grava na galeria do dispositivo
        await MediaLibrary.createAssetAsync(targetPath);
      }

      Alert.alert('Sucesso! 🎉', `${images.length} imagem(ns) salva(s) na sua galeria.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro ao Salvar', 'Não foi possível salvar a imagem na galeria.');
    } finally {
      setLoading(false);
    }
  };

  const shareImage = async () => {
    if (!images || images.length === 0) {
      Alert.alert('Atenção', 'Nenhuma imagem para compartilhar.');
      return;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
      return;
    }

    try {
      await Sharing.shareAsync(images[0].uri);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um problema ao compartilhar.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnSave} onPress={saveToGallery} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>💾 Salvar na Galeria</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnShare} onPress={shareImage} disabled={loading}>
        <Text style={styles.btnText}>📤 Compartilhar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, gap: 10 },
  btnSave: { backgroundColor: '#34c759', padding: 16, borderRadius: 10, alignItems: 'center' },
  btnShare: { backgroundColor: '#5856d6', padding: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});