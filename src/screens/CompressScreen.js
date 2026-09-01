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

// Opções de níveis de compressão
const COMPRESSION_LEVELS = [
  { id: 'light', name: 'Leve (90%)', quality: 0.9, desc: 'Perda imperceptível de qualidade' },
  { id: 'medium', name: 'Média (70%)', quality: 0.7, desc: 'Excelente equilíbrio tamanho x qualidade' },
  { id: 'high', name: 'Alta (50%)', quality: 0.5, desc: 'Redução significativa para envio rápido' },
  { id: 'extreme', name: 'Máxima (30%)', quality: 0.3, desc: 'Menor arquivo possível' },
];

export default function CompressScreen({ route, navigation }) {
  const params = route.params || {};
  // Aceita múltiplas imagens (novo fluxo) ou uma única (compatibilidade)
  const images = params.images || (params.imageUri ? [{ uri: params.imageUri }] : []);

  const [selectedLevelId, setSelectedLevelId] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState(null); // [{ originalUri, processedUri, originalSizeKB, processedSizeKB }]

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

  const handleApplyCompression = async () => {
    if (images.length === 0) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      const selectedOption = COMPRESSION_LEVELS.find((c) => c.id === selectedLevelId);
      const batchResults = [];

      for (const image of images) {
        const originalSizeKB = await getFileSizeKB(image.uri);
        const result = await ImageManipulator.manipulateAsync(
          image.uri,
          [],
          { compress: selectedOption.quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        const processedSizeKB = await getFileSizeKB(result.uri);

        batchResults.push({
          originalUri: image.uri,
          processedUri: result.uri,
          originalSizeKB,
          processedSizeKB,
        });
      }

      setResults(batchResults);
    } catch (error) {
      Alert.alert('Erro na compressão', error.message || 'Falha ao comprimir as imagens.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!results || results.length === 0) return;

    try {
      setIsSaving(true);
      const count = await saveImagesToGallery(results.map((r) => r.processedUri));
      Alert.alert('Sucesso! 🎉', `${count} ${count === 1 ? 'imagem comprimida foi salva' : 'imagens comprimidas foram salvas'} na galeria.`);
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedOption = COMPRESSION_LEVELS.find((c) => c.id === selectedLevelId);

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      {/* Título & Descrição */}
      <Text style={styles.title}>Compressão de Imagem</Text>
      <Text style={styles.subtitle}>
        Reduza o peso da imagem sem perder visualmente a qualidade original.
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

      {/* Níveis de Compressão */}
      <Text style={styles.sectionTitle}>NÍVEL DE COMPRESSÃO</Text>
      <View style={styles.levelList}>
        {COMPRESSION_LEVELS.map((item) => {
          const isSelected = selectedLevelId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.levelCard, isSelected && styles.levelCardSelected]}
              onPress={() => setSelectedLevelId(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.levelHeader}>
                <Text style={[styles.levelTitle, isSelected && styles.levelTitleSelected]}>
                  {item.name}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={18} color="#8b5cf6" />}
              </View>
              <Text style={styles.levelDesc}>{item.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botão de Ação */}
      <TouchableOpacity
        style={[styles.actionButton, isProcessing && styles.buttonDisabled]}
        onPress={handleApplyCompression}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="contract-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>
              Comprimir em {selectedOption?.name.split(' ')[0]}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Resultado da Compressão */}
      {results && results.length > 0 && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
            <Text style={styles.resultTitle}>Compressão Concluída!</Text>
          </View>

          {results.map((item, index) => (
            <View key={index} style={styles.resultItemRow}>
              <Image source={{ uri: item.processedUri }} style={styles.resultThumbnail} resizeMode="cover" />
              {item.processedSizeKB && item.originalSizeKB && (
                <View style={styles.comparisonContainer}>
                  <Text style={styles.resultSizeText}>
                    <Text style={{ color: '#ef4444' }}>{item.originalSizeKB} KB</Text>
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#94a3b8" style={{ marginHorizontal: 8 }} />
                  <Text style={styles.resultSizeText}>
                    <Text style={{ color: '#10b981', fontWeight: 'bold' }}>{item.processedSizeKB} KB</Text>
                  </Text>
                </View>
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
  levelList: {
    gap: 10,
    marginBottom: 24,
  },
  levelCard: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 14,
    padding: 14,
  },
  levelCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a1833',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  levelTitleSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  levelDesc: {
    fontSize: 12,
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
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultSizeText: {
    fontSize: 14,
    color: '#94a3b8',
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