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

// Lista de formatos suportados
const FORMATS = [
  { id: 'jpeg', name: 'JPG / JPEG', ext: 'jpg', mime: 'image/jpeg', supportedNative: true },
  { id: 'png', name: 'PNG', ext: 'png', mime: 'image/png', supportedNative: true },
  { id: 'webp', name: 'WebP', ext: 'webp', mime: 'image/webp', supportedNative: true },
  { id: 'avif', name: 'AVIF', ext: 'avif', mime: 'image/avif', supportedNative: false },
  { id: 'gif', name: 'GIF', ext: 'gif', mime: 'image/gif', supportedNative: false },
  { id: 'bmp', name: 'BMP', ext: 'bmp', mime: 'image/bmp', supportedNative: false },
  { id: 'tiff', name: 'TIFF', ext: 'tiff', mime: 'image/tiff', supportedNative: false },
  { id: 'heic', name: 'HEIC / HEIF', ext: 'heic', mime: 'image/heic', supportedNative: false },
];

export default function ConvertScreen({ route, navigation }) {
  const params = route.params || {};
  const images = params.images || (params.imageUri ? [{ uri: params.imageUri }] : []);

  const [selectedFormat, setSelectedFormat] = useState('png');
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

  // Função principal de conversão (aplica a todas as imagens selecionadas)
  const handleConvert = async () => {
    if (images.length === 0) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    const target = FORMATS.find((f) => f.id === selectedFormat);

    if (!target.supportedNative) {
      Alert.alert(
        'Formato Especial',
        `A conversão direta para ${target.name} requer suporte a bibliotecas adicionais no dispositivo.`
      );
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      // Mapeamento para os tipos suportados pelo expo-image-manipulator
      let saveFormat = ImageManipulator.SaveFormat.JPEG;
      if (selectedFormat === 'png') saveFormat = ImageManipulator.SaveFormat.PNG;
      if (selectedFormat === 'webp') saveFormat = ImageManipulator.SaveFormat.WEBP;

      const batchResults = [];
      for (const image of images) {
        const result = await ImageManipulator.manipulateAsync(
          image.uri,
          [], // Nenhuma transformação geométrica, apenas conversão
          { compress: 0.9, format: saveFormat }
        );
        const sizeKB = await getFileSizeKB(result.uri);
        batchResults.push({ processedUri: result.uri, sizeKB });
      }

      setResults(batchResults);
    } catch (error) {
      Alert.alert('Erro na conversão', error.message || 'Falha ao processar as imagens.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Salvar todas as imagens convertidas na galeria
  const handleSaveToGallery = async () => {
    if (!results || results.length === 0) return;

    try {
      setIsSaving(true);
      const count = await saveImagesToGallery(results.map((r) => r.processedUri));
      Alert.alert('Sucesso! 🎉', `${count} ${count === 1 ? 'imagem convertida foi salva' : 'imagens convertidas foram salvas'} na galeria.`);
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      {/* Título & Descrição */}
      <Text style={styles.title}>Converter Formato</Text>
      <Text style={styles.subtitle}>
        Escolha o formato de saída para o qual deseja converter sua imagem.
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

      {/* Seleção do Formato de Destino */}
      <Text style={styles.sectionTitle}>FORMATO DE SAÍDA</Text>
      <View style={styles.formatGrid}>
        {FORMATS.map((item) => {
          const isSelected = selectedFormat === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.formatChip, isSelected && styles.formatChipSelected]}
              onPress={() => setSelectedFormat(item.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.formatText, isSelected && styles.formatTextSelected]}>
                {item.name}
              </Text>
              {isSelected && <Ionicons name="checkmark-circle" size={16} color="#8b5cf6" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botão de Ação: Converter */}
      <TouchableOpacity
        style={[styles.actionButton, isProcessing && styles.buttonDisabled]}
        onPress={handleConvert}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="repeat-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>
              Converter para {FORMATS.find((f) => f.id === selectedFormat)?.name}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Resultado da Conversão */}
      {results && results.length > 0 && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
            <Text style={styles.resultTitle}>Conversão Concluída!</Text>
          </View>

          {results.map((item, index) => (
            <View key={index} style={styles.resultItemRow}>
              <Image source={{ uri: item.processedUri }} style={styles.resultThumbnail} resizeMode="cover" />
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
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: '47%',
    justifyContent: 'space-between',
  },
  formatChipSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a1833',
  },
  formatText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  formatTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
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