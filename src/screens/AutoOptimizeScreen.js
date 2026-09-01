import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  PixelRatio,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { saveImagesToGallery } from '../utils/gallery';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const scale = PixelRatio.get();

const nativeWidth = Math.round(viewportWidth * scale);
const nativeHeight = Math.round(viewportHeight * scale);

const PRESETS = [
  {
    id: 'wallpaper',
    title: 'Papel de parede',
    description: `Ajusta para a resolução nativa da sua tela (${nativeWidth} × ${nativeHeight} px)`,
    icon: 'phone-portrait-outline',
    targetFormat: 'WEBP/JPEG',
    quality: '90%',
  },
  {
    id: 'web',
    title: 'Usar na web',
    description: 'Converte para WebP, reduz dimensões e otimiza para carregamento rápido',
    icon: 'globe-outline',
    targetFormat: 'WebP',
    quality: '80%',
  },
  {
    id: 'social',
    title: 'Redes sociais',
    description: 'Enquadramento e otimização ideal para Instagram, WhatsApp e redes em geral',
    icon: 'share-social-outline',
    targetFormat: 'JPEG',
    quality: '85%',
  },
  {
    id: 'print',
    title: 'Imprimir',
    description: 'Preserva máxima qualidade, ajustando DPI para impressão física limpa',
    icon: 'print-outline',
    targetFormat: 'PNG / JPEG high-res',
    quality: '100%',
  },
  {
    id: 'save_space',
    title: 'Economizar espaço',
    description: 'Comprime ao máximo o tamanho do arquivo sem perder nitidez visível',
    icon: 'archive-outline',
    targetFormat: 'WebP',
    quality: '65%',
  },
];

// Calcula o recorte central que preserva o aspecto alvo, evitando distorção no resize
const getCenterCropAction = (originalWidth, originalHeight, targetWidth, targetHeight) => {
  const targetAspect = targetWidth / targetHeight;
  const originalAspect = originalWidth / originalHeight;

  let cropWidth = originalWidth;
  let cropHeight = originalHeight;

  if (originalAspect > targetAspect) {
    cropHeight = originalHeight;
    cropWidth = originalHeight * targetAspect;
  } else {
    cropWidth = originalWidth;
    cropHeight = originalWidth / targetAspect;
  }

  const originX = Math.round((originalWidth - cropWidth) / 2);
  const originY = Math.round((originalHeight - cropHeight) / 2);

  return {
    crop: {
      originX,
      originY,
      width: Math.round(cropWidth),
      height: Math.round(cropHeight),
    },
  };
};

// Define as ações de redimensionamento e o formato de saída para cada perfil
const getPresetConfig = (presetId) => {
  switch (presetId) {
    case 'wallpaper':
      return {
        cropTo: { width: nativeWidth, height: nativeHeight },
        saveOptions: { compress: 0.9, format: ImageManipulator.SaveFormat.WEBP },
      };
    case 'web':
      return {
        actions: [{ resize: { width: 1600 } }],
        saveOptions: { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP },
      };
    case 'social':
      return {
        actions: [{ resize: { width: 1080 } }],
        saveOptions: { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      };
    case 'print':
      return {
        actions: [],
        saveOptions: { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      };
    case 'save_space':
      return {
        actions: [{ resize: { width: 1280 } }],
        saveOptions: { compress: 0.65, format: ImageManipulator.SaveFormat.WEBP },
      };
    default:
      return { actions: [], saveOptions: { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG } };
  }
};

export default function AutoOptimizeScreen({ route }) {
  const initialParams = route.params || {};

  // Aceita múltiplas imagens (novo fluxo) ou uma única (compatibilidade)
  const initialImages = initialParams.images
    ? initialParams.images.map((img) => img.uri)
    : initialParams.imageUri
    ? [initialParams.imageUri]
    : [];
  const [selectedImages, setSelectedImages] = useState(initialImages);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Seleção múltipla habilitada no ImagePicker
  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Acesse a galeria para selecionar as fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Formato recomendado para SDKs recentes
      allowsMultipleSelection: true, // Habilita seleção múltipla
      selectionLimit: 0, // 0 libera seleção sem limite na maioria dos aparelhos
      orderedSelection: true, // Mantém a ordem de seleção no Android
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uris = result.assets.map((asset) => asset.uri);
      setSelectedImages(uris);
      setProcessedResult(null);
    }
  };

  const handleOptimize = async (preset) => {
    if (selectedImages.length === 0) {
      Alert.alert('Selecione ao menos uma imagem', 'Por favor, adicione fotos para otimizar.');
      return;
    }

    setSelectedPreset(preset.id);
    setIsProcessing(true);
    setProcessedResult(null);

    try {
      const { actions, cropTo, saveOptions } = getPresetConfig(preset.id);
      const processedUris = [];

      for (const uri of selectedImages) {
        let finalActions = actions;
        let sourceUri = uri;

        // Presets com largura e altura fixas recebem um recorte central antes do resize
        if (cropTo) {
          // Normaliza a orientação (EXIF) antes de calcular o recorte, para as dimensões
          // baterem exatamente com o que o manipulador vai efetivamente cortar
          const normalized = await ImageManipulator.manipulateAsync(uri, [], { compress: 1 });
          sourceUri = normalized.uri;
          const cropAction = getCenterCropAction(normalized.width, normalized.height, cropTo.width, cropTo.height);
          finalActions = [cropAction, { resize: cropTo }];
        }

        const result = await ImageManipulator.manipulateAsync(sourceUri, finalActions, saveOptions);
        processedUris.push(result.uri);
      }

      setProcessedResult({
        presetName: preset.title,
        format: preset.targetFormat,
        quality: preset.quality,
        totalFiles: selectedImages.length,
        processedUris,
      });
    } catch (error) {
      Alert.alert('Erro no processamento', error.message || 'Falha ao otimizar as imagens.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Salva as imagens já otimizadas no álbum TELAFIT
  const handleSaveToGallery = async () => {
    const imagesToSave = processedResult?.processedUris || [];
    if (imagesToSave.length === 0) return;

    try {
      setIsSaving(true);
      const count = await saveImagesToGallery(imagesToSave);
      Alert.alert(
        'Sucesso! 🚀',
        `${count} ${count === 1 ? 'imagem foi salva' : 'imagens foram salvas'} na pasta "TELAFIT".`
      );
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message || 'Não foi possível gravar as imagens na galeria.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Otimização Automática</Text>
      <Text style={styles.subtitle}>
        Selecione uma ou mais fotos para aplicar lote de otimização inteligente.
      </Text>

      {/* Área de Seleção e Carrossel / Grid de Preview */}
      <TouchableOpacity style={styles.uploadArea} onPress={pickImages} activeOpacity={0.8}>
        {selectedImages.length > 0 ? (
          <View style={styles.previewContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
              {selectedImages.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.thumbnail} resizeMode="cover" />
              ))}
            </ScrollView>
            <View style={styles.changeBadge}>
              <Ionicons name="images-outline" size={16} color="#ffffff" style={{ marginLeft: 10, marginRight: 6 }} />
              <Text style={styles.changeBadgeText}>
                {selectedImages.length} {selectedImages.length === 1 ? 'foto selecionada' : 'fotos selecionadas'} (Alterar)
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="add-circle-outline" size={40} color="#8b5cf6" />
            <Text style={styles.uploadText}>Toque para adicionar fotos (múltiplas)</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>O QUE VOCÊ QUER FAZER?</Text>

      {PRESETS.map((item) => {
        const isSelected = selectedPreset === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.presetCard, isSelected && styles.presetCardSelected]}
            activeOpacity={0.7}
            onPress={() => handleOptimize(item)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={22} color={isSelected ? '#8b5cf6' : '#a0aec0'} />
            </View>
            <View style={styles.presetTextContainer}>
              <Text style={styles.presetTitle}>{item.title}</Text>
              <Text style={styles.presetDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Otimizando lote de imagens...</Text>
        </View>
      )}

      {processedResult && !isProcessing && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" style={{ marginRight: 8 }} />
            <Text style={styles.resultHeaderTitle}>Lote Processado com Sucesso!</Text>
          </View>
          <Text style={styles.resultDetails}>
            Arquivos processados: <Text style={styles.boldText}>{processedResult.totalFiles}</Text>
          </Text>
          <Text style={styles.resultDetails}>
            Perfil aplicado: <Text style={styles.boldText}>{processedResult.presetName}</Text>
          </Text>

          <TouchableOpacity
            style={styles.downloadButton}
            activeOpacity={0.8}
            onPress={handleSaveToGallery}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.downloadButtonText}>Salvar todas no Álbum "TELAFIT"</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0a0914' },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20, lineHeight: 20 },
  uploadArea: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderStyle: 'dashed',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  uploadPlaceholder: { paddingVertical: 30, alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginTop: 10 },
  previewContainer: { padding: 12 },
  carousel: { flexDirection: 'row', marginBottom: 10 },
  thumbnail: { width: 100, height: 100, borderRadius: 12, marginRight: 10 },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    paddingVertical: 8,
    borderRadius: 12,
  },
  changeBadgeText: { fontSize: 13, color: '#ffffff', fontWeight: '600' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', letterSpacing: 1.5, marginBottom: 16 },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121124',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#1e1c38',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  presetCardSelected: { borderColor: '#8b5cf6', backgroundColor: '#1a1833' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1833',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  presetTextContainer: { flex: 1 },
  presetTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 2 },
  presetDescription: { fontSize: 12, color: '#94a3b8', lineHeight: 16 },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  loadingText: { fontSize: 14, color: '#94a3b8', marginTop: 10 },
  resultCard: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },
  resultDetails: { fontSize: 13, color: '#94a3b8', marginBottom: 4 },
  boldText: { color: '#ffffff', fontWeight: 'bold' },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  downloadButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
});