import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { saveImagesToGallery } from '../utils/gallery';

// Lista de Presets por Dispositivo
const PRESETS = [
  { id: 'mobile_fullhd', name: 'Celular (Full HD)', width: 1080, height: 1920, icon: 'phone-portrait-outline' },
  { id: 'mobile_4k', name: 'Celular (2K/4K)', width: 1440, height: 2960, icon: 'phone-portrait-outline' },
  { id: 'tablet', name: 'Tablet / iPad', width: 1536, height: 2048, icon: 'tablet-portrait-outline' },
  { id: 'monitor_fhd', name: 'Monitor Full HD', width: 1920, height: 1080, icon: 'desktop-outline' },
  { id: 'monitor_2k', name: 'Monitor 2K (1440p)', width: 2560, height: 1440, icon: 'desktop-outline' },
  { id: 'monitor_4k', name: 'Monitor 4K UHD', width: 3840, height: 2160, icon: 'tv-outline' },
  { id: 'instagram_post', name: 'Instagram Feed (1:1)', width: 1080, height: 1080, icon: 'logo-instagram' },
  { id: 'instagram_story', name: 'Instagram Stories (9:16)', width: 1080, height: 1920, icon: 'logo-instagram' },
];

// Calcula o recorte central que preserva o aspecto alvo, evitando distorção no resize
const getCenterCropAction = (originalWidth, originalHeight, targetWidth, targetHeight) => {
  const targetRatio = targetWidth / targetHeight;
  const originalRatio = originalWidth / originalHeight;

  let cropWidth = originalWidth;
  let cropHeight = originalHeight;

  if (originalRatio > targetRatio) {
    cropHeight = originalHeight;
    cropWidth = originalHeight * targetRatio;
  } else {
    cropWidth = originalWidth;
    cropHeight = originalWidth / targetRatio;
  }

  return {
    crop: {
      originX: Math.round((originalWidth - cropWidth) / 2),
      originY: Math.round((originalHeight - cropHeight) / 2),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight),
    },
  };
};

export default function DevicePresetsScreen({ route, navigation }) {
  const params = route.params || {};
  const images = params.images || (params.imageUri ? [{ uri: params.imageUri, width: params.imageWidth, height: params.imageHeight }] : []);

  const [selectedPresetId, setSelectedPresetId] = useState('mobile_fullhd');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState(null); // [{ processedUri, sizeKB }]

  const getFileSizeKB = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        return (fileInfo.size / 1024).toFixed(1);
      }
    } catch (error) {
      console.log('Erro ao ler tamanho do arquivo:', error);
    }
    return null;
  };

  const handleApplyPreset = async () => {
    if (images.length === 0) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      const targetPreset = PRESETS.find((p) => p.id === selectedPresetId);
      const batchResults = [];

      for (const image of images) {
        // Normaliza a orientação (EXIF) e obtém as dimensões reais que o manipulador vai usar
        const normalized = await ImageManipulator.manipulateAsync(image.uri, [], { compress: 1 });
        const cropAction = getCenterCropAction(normalized.width, normalized.height, targetPreset.width, targetPreset.height);

        const result = await ImageManipulator.manipulateAsync(
          normalized.uri,
          [cropAction, { resize: { width: targetPreset.width, height: targetPreset.height } }],
          { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
        );

        const sizeKB = await getFileSizeKB(result.uri);
        batchResults.push({ processedUri: result.uri, sizeKB });
      }

      setResults(batchResults);
    } catch (error) {
      Alert.alert('Erro no processamento', error.message || 'Falha ao ajustar as imagens.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!results || results.length === 0) return;

    try {
      setIsSaving(true);
      const count = await saveImagesToGallery(results.map((r) => r.processedUri));
      Alert.alert('Sucesso! 🎉', `${count} ${count === 1 ? 'imagem ajustada foi salva' : 'imagens ajustadas foram salvas'} na galeria.`);
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      {/* Título & Descrição */}
      <Text style={styles.title}>Tela & Dispositivos</Text>
      <Text style={styles.subtitle}>
        Adeqúe o tamanho da imagem para telas de celulares, monitores, TVs e redes sociais.
      </Text>

      {/* Preview das Imagens Selecionadas */}
      {images.length > 0 && (
        <View style={styles.previewCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((image, index) => (
              <Image key={index} source={{ uri: image.uri }} style={styles.multiThumbnail} resizeMode="cover" />
            ))}
          </ScrollView>
          <Text style={styles.previewTextTitle}>
            {images.length} {images.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
          </Text>
        </View>
      )}

      {/* Seleção de Presets */}
      <Text style={styles.sectionTitle}>SELECIONE O DISPOSITIVO / RESOLUÇÃO</Text>
      <View style={styles.presetGrid}>
        {PRESETS.map((item) => {
          const isSelected = selectedPresetId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.presetChip, isSelected && styles.presetChipSelected]}
              onPress={() => setSelectedPresetId(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.presetHeader}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={isSelected ? '#8b5cf6' : '#a0aec0'}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                  {item.name}
                </Text>
              </View>
              <Text style={styles.presetDimensions}>
                {item.width} x {item.height}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botão de Ação */}
      <TouchableOpacity
        style={[styles.actionButton, isProcessing && styles.buttonDisabled]}
        onPress={handleApplyPreset}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="aspect-ratio-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>
              Ajustar para {selectedPreset?.name}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Resultado */}
      {results && results.length > 0 && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
            <Text style={styles.resultTitle}>Redimensionamento Concluído!</Text>
          </View>

          {results.map((item, index) => (
            <View key={index} style={styles.resultItemRow}>
              <Image source={{ uri: item.processedUri }} style={styles.resultThumbnail} resizeMode="contain" />
              {item.sizeKB && (
                <Text style={styles.resultSizeText}>
                  Novo tamanho: <Text style={{ fontWeight: 'bold', color: '#ffffff' }}>{item.sizeKB} KB</Text>
                </Text>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveToGallery} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Salvar todas na Galeria</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121124',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e1c38',
    marginBottom: 24,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 14,
  },
  multiThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  resultItemRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultThumbnail: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  previewInfo: {
    flex: 1,
  },
  previewTextTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  previewTextSub: {
    fontSize: 13,
    color: '#8b5cf6',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  presetChip: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: '48%',
  },
  presetChipSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a1833',
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    flexShrink: 1,
  },
  presetTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  presetDimensions: {
    fontSize: 11,
    color: '#64748b',
  },
  actionButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#121124',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10b981',
    alignItems: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  resultImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultSizeText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});