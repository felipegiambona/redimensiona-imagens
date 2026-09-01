import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRESET_RATIOS = [
  { id: '16_9', name: '16:9', width: 16, height: 9 },
  { id: '9_16', name: '9:16', width: 9, height: 16 },
  { id: '4_3', name: '4:3', width: 4, height: 3 },
  { id: '3_4', name: '3:4', width: 3, height: 4 },
  { id: '1_1', name: '1:1', width: 1, height: 1 },
  { id: '21_9', name: '21:9', width: 21, height: 9 },
];

export default function AspectRatioScreen() {
  const [widthInput, setWidthInput] = useState('1920');
  const [heightInput, setHeightInput] = useState('');
  const [selectedRatio, setSelectedRatio] = useState(PRESET_RATIOS[0]);
  const [activeInput, setActiveInput] = useState('width'); // 'width' ou 'height'

  // Cálculos dinâmicos
  const calculateMissingDimension = () => {
    const w = parseFloat(widthInput);
    const h = parseFloat(heightInput);
    const ratioMultiplier = selectedRatio.width / selectedRatio.height;

    if (activeInput === 'width' && w > 0) {
      const calculatedH = Math.round(w / ratioMultiplier);
      return {
        dimensionText: `${calculatedH} px`,
        fullResolution: `${w} × ${calculatedH}`,
      };
    } else if (activeInput === 'height' && h > 0) {
      const calculatedW = Math.round(h * ratioMultiplier);
      return {
        dimensionText: `${calculatedW} px`,
        fullResolution: `${calculatedW} × ${h}`,
      };
    }

    return { dimensionText: '--', fullResolution: '-- × --' };
  };

  const result = calculateMissingDimension();

  return (
    <ScrollView
      style={styles.background}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Título & Subtítulo */}
      <Text style={styles.title}>Calculadora de Proporção</Text>
      <Text style={styles.subtitle}>
        Insira uma dimensão e descubra a medida ideal para manter o enquadramento perfeito.
      </Text>

      {/* Seleção da Proporção */}
      <Text style={styles.sectionTitle}>SELECIONE A PROPORÇÃO</Text>
      <View style={styles.ratioGrid}>
        {PRESET_RATIOS.map((item) => {
          const isSelected = selectedRatio.id === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.ratioChip, isSelected && styles.ratioChipSelected]}
              onPress={() => setSelectedRatio(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.ratioChipText, isSelected && styles.ratioChipTextSelected]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Inputs de Dimensões */}
      <Text style={styles.sectionTitle}>ENTRADA DE VALORES</Text>
      <View style={styles.inputRow}>
        {/* Largura */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Largura (px)</Text>
          <TextInput
            style={[styles.input, activeInput === 'width' && styles.inputActive]}
            keyboardType="numeric"
            value={widthInput}
            onChangeText={(val) => {
              setActiveInput('width');
              setWidthInput(val);
            }}
            placeholder="Ex: 1920"
            placeholderTextColor="#475569"
          />
        </View>

        <Text style={styles.multiplierX}>×</Text>

        {/* Altura */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Altura (px)</Text>
          <TextInput
            style={[styles.input, activeInput === 'height' && styles.inputActive]}
            keyboardType="numeric"
            value={heightInput}
            onChangeText={(val) => {
              setActiveInput('height');
              setHeightInput(val);
            }}
            placeholder="Ex: 1080"
            placeholderTextColor="#475569"
          />
        </View>
      </View>

      {/* Card do Resultado Principal */}
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="calculator-outline" size={22} color="#8b5cf6" style={{ marginRight: 8 }} />
          <Text style={styles.resultHeaderTitle}>Dimensão Calculada</Text>
        </View>

        <Text style={styles.resultMainValue}>{result.dimensionText}</Text>
        <Text style={styles.resultSubValue}>Resolução Final: {result.fullResolution}</Text>
      </View>

      {/* Seção Exemplo de Recorte Rápido (4:3) */}
      <Text style={styles.sectionTitle}>SIMULAÇÃO DE CORTE (4:3)</Text>
      <View style={styles.cropCard}>
        <View style={styles.cropHeader}>
          <Ionicons name="crop-outline" size={20} color="#10b981" style={{ marginRight: 8 }} />
          <Text style={styles.cropTitle}>Quero cortar para 4:3</Text>
        </View>

        <Text style={styles.cropValue}>
          {widthInput && !isNaN(widthInput) ? `${Math.round((widthInput * 3) / 4)} × ${widthInput}` : '1440 × 1920'}
        </Text>
        <Text style={styles.cropSubtitle}>
          Mantendo a proporção 4:3 com base no maior lado fornecido.
        </Text>
      </View>
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
  ratioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  ratioChip: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#1e1c38',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  ratioChipSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a1833',
  },
  ratioChipText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  ratioChipTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  inputContainer: {
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
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  inputActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#1a1833',
  },
  multiplierX: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
    marginHorizontal: 12,
    marginTop: 18,
  },
  resultCard: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  resultMainValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  resultSubValue: {
    fontSize: 14,
    color: '#94a3b8',
  },
  cropCard: {
    backgroundColor: '#121124',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 16,
    padding: 16,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cropTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  cropValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cropSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
});