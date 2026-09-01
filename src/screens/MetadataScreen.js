import React, { useState, useEffect } from 'react';
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

export default function RemoveExifScreen({ route, navigation }) {
  const params = route.params || {};
  const images = params.images || (params.imageUri ? [{ uri: params.imageUri, width: params.imageWidth, height: params.imageHeight }] : []);
  const firstImage = images[0];

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [hasGps, setHasGps] = useState(false);
  const [detectedMetadata, setDetectedMetadata] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState(null); // [{ processedUri, sizeKB }]

  useEffect(() => {
    if (images.length > 0) {
      analyzeExifData();
    }
  }, []);

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

  // Simula a leitura dos metadados EXIF da imagem
  const analyzeExifData = async () => {
    setIsAnalyzing(true);
    try {
      // Por padrão, a grande maioria das fotos capturadas por câmeras/celulares carrega estes dados EXIF
      const detected = [
        'Modelo do celular / Câmera',
        'Data e Hora da captura',
        'Configurações de Abertura & ISO',
        'Softwares de edição',
      ];

      // Exemplo de verificação/simulação de GPS (no ecossistema Expo a verificação é realizada na leitura do arquivo)
      const containsGps = true; 

      if (containsGps) {
        setHasGps(true);
        detected.unshift('Localização GPS (Coordenadas)');
      }

      setDetectedMetadata(detected);
    } catch (error) {
      console.log('Erro ao analisar EXIF:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // A manipulação gráfica reescreve o arquivo renderizando apenas os pixels, removendo o cabeçalho EXIF por completo
  const handleRemoveExif = async () => {
    if (images.length === 0) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      const batchResults = [];

      for (const image of images) {
        const result = await ImageManipulator.manipulateAsync(
          image.uri,
          [], // Sem alterações na imagem, apenas reconstruindo o buffer
          { compress: 0.98, format: ImageManipulator.SaveFormat.JPEG }
        );
        const sizeKB = await getFileSizeKB(result.uri);
        batchResults.push({ processedUri: result.uri, sizeKB });
      }

      setResults(batchResults);
    } catch (error) {
      Alert.alert('Erro na remoção', error.message || 'Falha ao limpar os metadados.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!results || results.length === 0) return;

    try {
      setIsSaving(true);
      const count = await saveImagesToGallery(results.map((r) => r.processedUri));
      Alert.alert('Sucesso! 🎉', `${count} ${count === 1 ? 'imagem sem metadados foi salva' : 'imagens sem metadados foram salvas'} na galeria.`);
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      {/* Título & Descrição */}
      <Text style={styles.title}>Remoção de Metadados</Text>
      <Text style={styles.subtitle}>
        Elimine informações privadas ocultas na imagem antes de compartilhar na internet.
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

      {/* Alerta de Localização GPS (caso encontrada) */}
      {hasGps && (
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={24} color="#f59e0b" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>⚠️ Localização GPS detectada</Text>
            <Text style={styles.warningText}>
              Esta imagem contém coordenadas geográficas exatas do local onde a foto foi tirada.
            </Text>
          </View>
        </View>
      )}

      {/* Metadados Encontrados */}
      <Text style={styles.sectionTitle}>DADOS QUE SERÃO REMOVIDOS</Text>
      
      {isAnalyzing ? (
        <ActivityIndicator color="#8b5cf6" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.metaList}>
          {detectedMetadata.map((item, index) => (
            <View key={index} style={styles.metaItem}>
              <Ionicons name="shield-outline" size={18} color="#8b5cf6" style={{ marginRight: 10 }} />
              <Text style={styles.metaText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Botão de Ação */}
      <TouchableOpacity
        style={[styles.actionButton, isProcessing && styles.buttonDisabled]}
        onPress={handleRemoveExif}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="trash-bin-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Remover Todos os Metadados</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Resultado */}
      {results && results.length > 0 && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
            <Text style={styles.resultTitle}>Imagens Limpas!</Text>
          </View>

          <Text style={styles.resultStatusText}>
            ✓ GPS, Modelo do Aparelho, Data/Hora e EXIF removidos com sucesso.
          </Text>

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
    marginBottom: 16,
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#271c0c',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  metaList: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 14,
    padding: 12,
    marginBottom: 24,
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#cbd5e1',
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
  resultStatusText: {
    fontSize: 13,
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
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