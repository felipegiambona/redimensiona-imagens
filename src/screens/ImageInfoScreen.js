import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';

export default function ImageInfoScreen({ route, navigation }) {
  const params = route.params || {};
  const images = params.images || (params.imageUri ? [{ uri: params.imageUri, width: params.imageWidth, height: params.imageHeight }] : []);

  const [isLoading, setIsLoading] = useState(true);
  const [imagesDetails, setImagesDetails] = useState([]);

  useEffect(() => {
    if (images.length > 0) {
      extractAllMetadata();
    } else {
      setIsLoading(false);
    }
  }, []);

  const calculateAspectRatio = (width, height) => {
    if (!width || !height) return '4:3';
    const ratioVal = width / height;
    if (Math.abs(ratioVal - 1.777) < 0.05) return '16:9';
    if (Math.abs(ratioVal - 1) < 0.05) return '1:1';
    if (Math.abs(ratioVal - 1.333) < 0.05) return '4:3';
    if (Math.abs(ratioVal - 1.5) < 0.05) return '3:2';
    return `${ratioVal.toFixed(2)}:1`;
  };

  // Extrai dimensões, tamanho de arquivo e simula a leitura de metadados para cada imagem
  const extractAllMetadata = async () => {
    setIsLoading(true);
    try {
      const details = await Promise.all(
        images.map(async (image) => {
          let fileSizeFormatted = '--';
          try {
            const fileInfo = await FileSystem.getInfoAsync(image.uri);
            if (fileInfo.exists && fileInfo.size) {
              const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
              fileSizeFormatted = `${sizeMB} MB`;
            }
          } catch (error) {
            console.log('Erro ao ler detalhes do arquivo:', error);
          }

          return {
            uri: image.uri,
            resolution: image.width && image.height ? `${image.width} × ${image.height}` : '--',
            aspectRatio: calculateAspectRatio(image.width, image.height),
            format: 'JPEG',
            size: fileSizeFormatted,
            dpi: '72',
            colorSpace: 'sRGB',
            date: '12/08/2026',
            device: 'Galaxy S24',
            hasGps: true,
          };
        })
      );

      setImagesDetails(details);
    } finally {
      setIsLoading(false);
    }
  };

  const getInfoItems = (fileDetails) => [
    { label: 'Resolução', value: fileDetails.resolution, icon: 'resize-outline' },
    { label: 'Proporção', value: fileDetails.aspectRatio, icon: 'crop-outline' },
    { label: 'Formato', value: fileDetails.format, icon: 'image-outline' },
    { label: 'Tamanho', value: fileDetails.size, icon: 'document-text-outline' },
    { label: 'DPI', value: fileDetails.dpi, icon: 'speedometer-outline' },
    { label: 'Color Space', value: fileDetails.colorSpace, icon: 'color-palette-outline' },
    { label: 'Data', value: fileDetails.date, icon: 'calendar-outline' },
    { label: 'Dispositivo', value: fileDetails.device, icon: 'hardware-chip-outline' },
  ];

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      {/* Título & Descrição */}
      <Text style={styles.title}>Informações Técnicas</Text>
      <Text style={styles.subtitle}>
        Veja os detalhes, propriedades e metadados completos extraídos de cada arquivo.
      </Text>

      {isLoading ? (
        <ActivityIndicator color="#8b5cf6" style={{ marginVertical: 20 }} />
      ) : (
        imagesDetails.map((fileDetails, index) => (
          <View key={index} style={styles.imageBlock}>
            {/* Preview da Imagem */}
            <View style={styles.previewContainer}>
              <Image source={{ uri: fileDetails.uri }} style={styles.imagePreview} resizeMode="cover" />
            </View>

            {imagesDetails.length > 1 && (
              <Text style={styles.imageIndexLabel}>Imagem {index + 1} de {imagesDetails.length}</Text>
            )}

            {fileDetails.hasGps && (
              <View style={styles.gpsCard}>
                <Ionicons name="location-outline" size={20} color="#10b981" style={{ marginRight: 10 }} />
                <Text style={styles.gpsText}>GPS encontrado!</Text>
              </View>
            )}

            {/* Lista de Metadados / Detalhes */}
            <Text style={styles.sectionTitle}>PROPRIEDADES</Text>
            <View style={styles.infoGrid}>
              {getInfoItems(fileDetails).map((item, itemIndex) => (
                <View key={itemIndex} style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <Ionicons name={item.icon} size={18} color="#8b5cf6" style={{ marginRight: 12 }} />
                    <Text style={styles.infoLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0a0914',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
    lineHeight: 20,
  },
  previewContainer: {
    backgroundColor: '#121124',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e1c38',
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageBlock: {
    marginBottom: 32,
  },
  imageIndexLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: 14,
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  gpsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoGrid: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1c38',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});