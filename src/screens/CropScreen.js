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

// 1. Proporções Livres / Ratios
const ASPECT_RATIOS = [
  { id: 'ratio_1_1', name: '1:1', ratio: 1 / 1, desc: 'Quadrado' },
  { id: 'ratio_4_3', name: '4:3', ratio: 4 / 3, desc: 'Padrão / Foto' },
  { id: 'ratio_3_2', name: '3:2', ratio: 3 / 2, desc: 'Câmera DSLR' },
  { id: 'ratio_16_9', name: '16:9', ratio: 16 / 9, desc: 'Widescreen / TV' },
  { id: 'ratio_9_16', name: '9:16', ratio: 9 / 16, desc: 'Vertical / Stories' },
  { id: 'ratio_21_9', name: '21:9', ratio: 21 / 9, desc: 'Ultrawide' },
];

// 2. Presets de Redes Sociais com Resoluções Exatas
const SOCIAL_PRESETS = [
  { id: 'insta_post', name: 'Instagram Post', width: 1080, height: 1080, icon: 'logo-instagram' },
  { id: 'insta_story', name: 'Instagram Story/Reels', width: 1080, height: 1920, icon: 'logo-instagram' },
  { id: 'yt_thumb', name: 'YouTube Thumbnail', width: 1280, height: 720, icon: 'logo-youtube' },
  { id: 'whatsapp_dp', name: 'WhatsApp Perfil', width: 640, height: 640, icon: 'logo-whatsapp' },
  { id: 'fb_post', name: 'Facebook Post', width: 1200, height: 630, icon: 'logo-facebook' },
  { id: 'linkedin_banner', name: 'LinkedIn Banner', width: 1584, height: 396, icon: 'logo-linkedin' },
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

export default function CropScreen({ route, navigation }) {
  const params = route.params || {};
  const images = params.images || (params.imageUri ? [{ uri: params.imageUri, width: params.imageWidth, height: params.imageHeight }] : []);

  const [selectedType, setSelectedType] = useState('ratio'); // 'ratio' ou 'social'
  const [selectedId, setSelectedId] = useState('ratio_1_1');
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

  // Função para executar o corte / redimensionamento em todas as imagens selecionadas
  const handleApplyCrop = async () => {
    if (images.length === 0) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      let targetWidth;
      let targetHeight;

      if (selectedType === 'ratio') {
        const targetRatioObj = ASPECT_RATIOS.find((r) => r.id === selectedId);
        targetWidth = targetRatioObj.ratio;
        targetHeight = 1; // usado apenas como proporção, resolvido por imagem abaixo
      } else {
        const socialObj = SOCIAL_PRESETS.find((s) => s.id === selectedId);
        targetWidth = socialObj.width;
        targetHeight = socialObj.height;
      }

      const batchResults = [];

      for (const image of images) {
        // Normaliza a orientação (EXIF) e obtém as dimensões reais que o manipulador vai usar
        const normalized = await ImageManipulator.manipulateAsync(image.uri, [], { compress: 1 });
        const { width: originalWidth, height: originalHeight, uri: normalizedUri } = normalized;

        const actions = [];
        if (selectedType === 'ratio') {
          actions.push(getCenterCropAction(originalWidth, originalHeight, targetWidth, targetHeight));
        } else {
          const cropAction = getCenterCropAction(originalWidth, originalHeight, targetWidth, targetHeight);
          actions.push(cropAction, { resize: { width: targetWidth, height: targetHeight } });
        }

        const result = await ImageManipulator.manipulateAsync(
          normalizedUri,
          actions,
          { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
        );

        const sizeKB = await getFileSizeKB(result.uri);
        batchResults.push({ processedUri: result.uri, sizeKB });
      }

      setResults(batchResults);
    } catch (error) {
      Alert.alert('Erro no corte', error.message || 'Falha ao processar as imagens.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!results || results.length === 0) return;

    try {
      setIsSaving(true);
      const count = await saveImagesToGallery(results.map((r) => r.processedUri));
      Alert.alert('Sucesso! 🎉', `${count} ${count === 1 ? 'imagem cortada foi salva' : 'imagens cortadas foram salvas'} na galeria.`);
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      {/* Título & Descrição */}
      <Text style={styles.title}>Corte Inteligente</Text>
      <Text style={styles.subtitle}>
        Ajuste proporções de tela ou escolha formatos prontos para redes sociais.
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

      {/* Seção 1: Proporções (Aspect Ratios) */}
      <Text style={styles.sectionTitle}>PROPORÇÕES DE TELA</Text>
      <View style={styles.grid}>
        {ASPECT_RATIOS.map((item) => {
          const isSelected = selectedType === 'ratio' && selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => {
                setSelectedType('ratio');
                setSelectedId(item.id);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.chipHeader}>
                <Text style={[styles.chipTitle, isSelected && styles.chipTitleSelected]}>
                  {item.name}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={16} color="#8b5cf6" />}
              </View>
              <Text style={styles.chipSubtitle}>{item.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Seção 2: Redes Sociais */}
      <Text style={styles.sectionTitle}>PRESETS REDES SOCIAIS</Text>
      <View style={styles.grid}>
        {SOCIAL_PRESETS.map((item) => {
          const isSelected = selectedType === 'social' && selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => {
                setSelectedType('social');
                setSelectedId(item.id);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.chipHeader}>
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={isSelected ? '#8b5cf6' : '#a0aec0'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.chipTitle, isSelected && styles.chipTitleSelected, { flexShrink: 1 }]}>
                  {item.name}
                </Text>
              </View>
              <Text style={styles.chipSubtitle}>{item.width} x {item.height} px</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botão de Ação */}
      <TouchableOpacity
        style={[styles.actionButton, isProcessing && styles.buttonDisabled]}
        onPress={handleApplyCrop}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="crop-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Aplicar Corte</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Resultado */}
      {results && results.length > 0 && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
            <Text style={styles.resultTitle}>Corte Concluído!</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: '48%',
  },
  chipSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a1833',
  },
  chipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chipTitle: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  chipTitleSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  chipSubtitle: {
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