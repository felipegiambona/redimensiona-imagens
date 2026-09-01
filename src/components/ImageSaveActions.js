import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export default function ImageSaveActions({ images, targetWidth, targetHeight, cropRegion }) {
  const [loading, setLoading] = useState(false);

  // Função auxiliar para aplicar as transformações de imagem (redimensionamento / corte)
  const processImage = async (imageUri) => {
    const actions = [];

    // Adiciona ação de corte (crop), se especificado: { originX, originY, width, height }
    if (cropRegion) {
      actions.push({ crop: cropRegion });
    }

    // Adiciona ação de redimensionamento (resize)
    if (targetWidth || targetHeight) {
      actions.push({
        resize: {
          width: targetWidth,
          height: targetHeight,
        },
      });
    }

    // Se nenhuma alteração foi solicitada, retorna a URI original
    if (actions.length === 0) {
      return imageUri;
    }

    // Processa a imagem e retorna a nova URI temporária
    const result = await manipulateAsync(
      imageUri,
      actions,
      { compress: 0.9, format: SaveFormat.JPEG }
    );

    return result.uri;
  };

  const saveToGallery = async () => {
    if (!images || images.length === 0) {
      Alert.alert('Atenção', 'Nenhuma imagem selecionada para salvar.');
      return;
    }

    setLoading(true);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);

      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessária permissão de fotos para salvar na galeria.');
        setLoading(false);
        return;
      }

      for (const img of images) {
        // 1. Processa/Redimensiona a imagem antes de salvar
        const processedUri = await processImage(img.uri);

        // 2. Copia para o sistema de arquivos local do app
        const filename = `telafit_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
        const targetPath = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.copyAsync({
          from: processedUri,
          to: targetPath,
        });

        // 3. Salva no álbum padrão da galeria
        await MediaLibrary.saveToLibraryAsync(targetPath);
      }

      Alert.alert('Sucesso! 🎉', `${images.length} imagem(ns) salva(s) na sua galeria.`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert(
        'Erro ao Salvar',
        'Não foi possível salvar a imagem na galeria. No Expo Go, o Android limita o acesso à galeria — para acesso completo (álbuns), gere um development build.'
      );
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

    setLoading(true);

    try {
      // Processa a primeira imagem antes de compartilhar
      const processedUri = await processImage(images[0].uri);
      await Sharing.shareAsync(processedUri);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao compartilhar.');
    } finally {
      setLoading(false);
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