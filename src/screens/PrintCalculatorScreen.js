import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Definições de tamanhos padrão em milímetros (mm)
const PAPER_SIZES = [
  { id: 'a4', name: 'A4', widthMm: 210, heightMm: 297, desc: '21 × 29.7 cm' },
  { id: 'a3', name: 'A3', widthMm: 297, heightMm: 420, desc: '29.7 × 42 cm' },
  { id: 'a5', name: 'A5', widthMm: 148, heightMm: 210, desc: '14.8 × 21 cm' },
  { id: '10x15', name: '10×15 cm', widthMm: 100, heightMm: 150, desc: 'Foto padrão' },
  { id: '13x18', name: '13×18 cm', widthMm: 130, heightMm: 180, desc: 'Porta-retrato' },
  { id: 'custom', name: 'Personalizado', widthMm: 0, heightMm: 0, desc: 'Dimensões manuais' },
];

const DPI_OPTIONS = [72, 150, 300, 600];

export default function PrintCalculatorScreen() {
  const [selectedPaper, setSelectedPaper] = useState(PAPER_SIZES[0]);
  const [selectedDpi, setSelectedDpi] = useState(300);
  
  // Para tamanho personalizado (em cm)
  const [customWidthCm, setCustomWidthCm] = useState('20');
  const [customHeightCm, setCustomHeightCm] = useState('30');

  // Imagens selecionadas para checagem de qualidade de impressão (múltiplas)
  const [selectedImages, setSelectedImages] = useState([]);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Acesse a galeria para selecionar as fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImages(result.assets.map((asset) => ({ uri: asset.uri, width: asset.width, height: asset.height })));
    }
  };

  // Cálculo de converso de MM/CM para Pixels baseando-se no DPI
  // Fórmula: Pixels = (Medida_em_polegadas) * DPI = (Medida_em_mm / 25.4) * DPI
  const calculatePixels = () => {
    let wMm = selectedPaper.widthMm;
    let hMm = selectedPaper.heightMm;

    if (selectedPaper.id === 'custom') {
      wMm = (parseFloat(customWidthCm) || 0) * 10;
      hMm = (parseFloat(customHeightCm) || 0) * 10;
    }

    const widthPx = Math.round((wMm / 25.4) * selectedDpi);
    const heightPx = Math.round((hMm / 25.4) * selectedDpi);

    return {
      widthPx,
      heightPx,
      resolutionText: `${widthPx} × ${heightPx} px`,
    };
  };

  const result = calculatePixels();

  // Para cada imagem selecionada, verifica se a resolução atende ao tamanho/DPI escolhidos
  const getImageVerdict = (image) => {
    if (!image.width || !image.height) {
      return { sufficient: null, maxSizeText: '--' };
    }

    const sufficient = image.width >= result.widthPx && image.height >= result.heightPx;

    // Tamanho máximo de impressão com boa qualidade, na proporção da própria imagem, ao DPI escolhido
    const maxWidthCm = ((image.width / selectedDpi) * 2.54).toFixed(1);
    const maxHeightCm = ((image.height / selectedDpi) * 2.54).toFixed(1);

    return {
      sufficient,
      maxSizeText: `${maxWidthCm} × ${maxHeightCm} cm`,
    };
  };

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      {/* Título & Subtítulo */}
      <Text style={styles.title}>Preparação para Impressão</Text>
      <Text style={styles.subtitle}>
        Calcule a resolução exata em pixels necessária para obter a melhor qualidade de impressão.
      </Text>

      {/* Seleção do Tamanho do Papel */}
      <Text style={styles.sectionTitle}>TAMANHO DO PAPEL / FORMATO</Text>
      <View style={styles.paperGrid}>
        {PAPER_SIZES.map((paper) => {
          const isSelected = selectedPaper.id === paper.id;
          return (
            <TouchableOpacity
              key={paper.id}
              style={[styles.paperCard, isSelected && styles.paperCardSelected]}
              onPress={() => setSelectedPaper(paper)}
              activeOpacity={0.7}
            >
              <Text style={[styles.paperName, isSelected && styles.paperNameSelected]}>
                {paper.name}
              </Text>
              <Text style={styles.paperDesc}>{paper.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Campos para Tamanho Personalizado */}
      {selectedPaper.id === 'custom' && (
        <View style={styles.customContainer}>
          <Text style={styles.sectionTitle}>DIMENSÕES EM CENTÍMETROS (CM)</Text>
          <View style={styles.customInputRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Largura (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={customWidthCm}
                onChangeText={setCustomWidthCm}
                placeholder="Ex: 20"
                placeholderTextColor="#475569"
              />
            </View>
            <Text style={styles.multiplierX}>×</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={customHeightCm}
                onChangeText={setCustomHeightCm}
                placeholder="Ex: 30"
                placeholderTextColor="#475569"
              />
            </View>
          </View>
        </View>
      )}

      {/* Seleção de DPI */}
      <Text style={styles.sectionTitle}>RESOLUÇÃO (DPI)</Text>
      <View style={styles.dpiRow}>
        {DPI_OPTIONS.map((dpi) => {
          const isSelected = selectedDpi === dpi;
          return (
            <TouchableOpacity
              key={dpi}
              style={[styles.dpiChip, isSelected && styles.dpiChipSelected]}
              onPress={() => setSelectedDpi(dpi)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dpiText, isSelected && styles.dpiTextSelected]}>
                {dpi} DPI
              </Text>
              {dpi === 300 && <Text style={styles.recommendedBadge}>Recomendado</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Card do Resultado Principal */}
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="print-outline" size={24} color="#10b981" style={{ marginRight: 8 }} />
          <Text style={styles.resultHeaderTitle}>Resolução Exigida</Text>
        </View>

        <Text style={styles.resultMainText}>
          Para imprimir em <Text style={styles.highlightText}>{selectedPaper.name}</Text> a{' '}
          <Text style={styles.highlightText}>{selectedDpi} DPI</Text>:
        </Text>

        <View style={styles.dimensionBadge}>
          <Text style={styles.dimensionText}>{result.resolutionText}</Text>
        </View>

        <Text style={styles.resultFootnote}>
          Use estas dimensões ao exportar ou recortar sua arte para garantir extrema nitidez.
        </Text>
      </View>

      {/* Verificação de Qualidade das Imagens Selecionadas */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>VERIFICAR SUAS IMAGENS</Text>
      <TouchableOpacity style={styles.pickButton} onPress={pickImages} activeOpacity={0.8}>
        <Ionicons name="images-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
        <Text style={styles.pickButtonText}>
          {selectedImages.length > 0
            ? `${selectedImages.length} ${selectedImages.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'} (Alterar)`
            : 'Selecionar imagens para verificar'}
        </Text>
      </TouchableOpacity>

      {selectedImages.map((image, index) => {
        const verdict = getImageVerdict(image);
        return (
          <View key={index} style={styles.imageCheckCard}>
            <Image source={{ uri: image.uri }} style={styles.imageCheckThumbnail} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.imageCheckResolution}>
                {image.width && image.height ? `${image.width} × ${image.height} px` : 'Resolução desconhecida'}
              </Text>
              <Text style={styles.imageCheckMaxSize}>Tamanho máx. recomendado: {verdict.maxSizeText}</Text>
              {verdict.sufficient !== null && (
                <View style={styles.verdictRow}>
                  <Ionicons
                    name={verdict.sufficient ? 'checkmark-circle' : 'alert-circle'}
                    size={16}
                    color={verdict.sufficient ? '#10b981' : '#ef4444'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.verdictText, { color: verdict.sufficient ? '#10b981' : '#ef4444' }]}>
                    {verdict.sufficient ? 'Resolução suficiente' : 'Resolução insuficiente para essa impressão'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  paperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paperCard: {
    width: '48%',
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  paperCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a1833',
  },
  paperName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  paperNameSelected: {
    color: '#8b5cf6',
  },
  paperDesc: {
    fontSize: 12,
    color: '#94a3b8',
  },
  customContainer: {
    marginBottom: 20,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  multiplierX: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
    marginHorizontal: 12,
    marginTop: 18,
  },
  dpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  dpiChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dpiChipSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a1833',
  },
  dpiText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  dpiTextSelected: {
    color: '#ffffff',
  },
  recommendedBadge: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  resultCard: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  resultMainText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  highlightText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dimensionBadge: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  dimensionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resultFootnote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  pickButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    marginBottom: 16,
  },
  pickButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  imageCheckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  imageCheckThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 14,
  },
  imageCheckResolution: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  imageCheckMaxSize: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verdictText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});