import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {

  // Função para abrir a galeria de fotos e navegar para a ferramenta escolhida
  const pickImageAndNavigate = async (targetScreen) => {
    // 1. Solicita permissão para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permissão necessária',
        'É necessário conceder permissão para acessar a galeria de fotos.'
      );
      return;
    }

    // 2. Abre a galeria de imagens, permitindo seleção múltipla
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Mantém as dimensões originais intactas
      allowsMultipleSelection: true,
      selectionLimit: 0, // Sem limite de seleção
      quality: 1, // Mantém qualidade máxima na seleção
    });

    // 3. Se o usuário escolheu ao menos uma imagem, navega passando todas elas
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const images = pickerResult.assets.map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      }));
      const firstImage = images[0];

      navigation.navigate(targetScreen, {
        images,
        // Mantidos para compatibilidade com telas que ainda leem uma única imagem
        imageUri: firstImage.uri,
        imageWidth: firstImage.width,
        imageHeight: firstImage.height,
      });
    }
  };

  return (
    <ScrollView style={styles.background} contentContainerStyle={styles.container}>
      {/* Nome da Marca / Header */}
      <Text style={styles.brandTitle}>TELAFIT</Text>
      
      {/* Título Principal */}
      <Text style={styles.mainTitle}>Suas imagens, do jeito certo em cada tela</Text>
      <Text style={styles.subHeaderDescription}>
        Tudo é processado no seu dispositivo — nada é enviado para servidores.
      </Text>

      {/* Card Destaque Roxo - Otimização Automática */}
      <TouchableOpacity 
        style={styles.heroCard}
        activeOpacity={0.85}
        onPress={() => pickImageAndNavigate('AutoOptimize')}
      >
        <View style={styles.heroIconWrapper}>
          <Ionicons name="sparkles" size={24} color="#ffffff" />
        </View>
        <Text style={styles.heroTitle}>Otimização automática</Text>
        <Text style={styles.heroDescription}>
          Adicione as imagens, escolha o objetivo e deixe o app decidir resolução, formato e qualidade.
        </Text>
      </TouchableOpacity>

      {/* Seção FERRAMENTAS */}
      <Text style={styles.sectionHeader}>FERRAMENTAS</Text>

      {/* 1. Tela & dispositivos */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.7}
        onPress={() => pickImageAndNavigate('DevicePresets')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="phone-portrait-outline" size={22} color="#a0aec0" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>Tela & dispositivos</Text>
          <Text style={styles.toolSubtitle}>Celular, tablet, monitor, TV, console</Text>
        </View>
      </TouchableOpacity>

      {/* 2. Compressão */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.7}
        onPress={() => pickImageAndNavigate('Compress')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="contract-outline" size={22} color="#a0aec0" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>Compressão</Text>
          <Text style={styles.toolSubtitle}>Qualidade fixa ou "reduzir para X MB"</Text>
        </View>
      </TouchableOpacity>

      {/* 3. Redimensionar / Converter formato */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.7}
        onPress={() => pickImageAndNavigate('Convert')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="repeat-outline" size={22} color="#a0aec0" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>Converter Formato</Text>
          <Text style={styles.toolSubtitle}>Converta para JPG, PNG, WebP, entre outros...</Text>
        </View>
      </TouchableOpacity>

      {/* 4. Corte inteligente */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.7}
        onPress={() => pickImageAndNavigate('Crop')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="crop-outline" size={22} color="#a0aec0" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>Corte Inteligente</Text>
          <Text style={styles.toolSubtitle}>Padrões de impressão, 1:1, 16:9, DPI</Text>
        </View>
      </TouchableOpacity>

      {/* 5. Remoção de Metadados EXIF */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.7}
        onPress={() => pickImageAndNavigate('Metadata')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#a0aec0" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>Remoção de Metadados</Text>
          <Text style={styles.toolSubtitle}>Elimine GPS, modelo de celular e dados EXIF</Text>
        </View>
      </TouchableOpacity>

      {/* 1. Informações Técnicas */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.7}
        onPress={() => pickImageAndNavigate('ImageInfo')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="information-circle-outline" size={22} color="#a0aec0" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>Informações</Text>
          <Text style={styles.toolSubtitle}>Resolução, formato, tamanho, DPI, GPS e metadados</Text>
        </View>
      </TouchableOpacity>

      {/* Calculadora de Proporção */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AspectRatio')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="calculator-outline" size={22} color="#a0aec0" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>Calculadora de Proporção</Text>
          <Text style={styles.toolSubtitle}>Calcule dimensões exatas (16:9, 4:3, 1:1)</Text>
        </View>
      </TouchableOpacity>

      {/* Preparação para Impressão */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PrintCalculator')}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="print-outline" size={22} color="#a0aec0" />
        </View>
        <View style={styles.toolTextContainer}>
          <Text style={styles.toolTitle}>Preparação para Impressão</Text>
          <Text style={styles.toolSubtitle}>A4, A3, 10x15 com cálculo de DPI (72, 150, 300, 600)</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0a0914', // Fundo escuro conforme a imagem
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8b5cf6',
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 34,
    marginBottom: 10,
  },
  subHeaderDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: '#8b5cf6', // Roxo vibrante do topo
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  heroIconWrapper: {
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    color: '#f1f5f9',
    lineHeight: 18,
    opacity: 0.9,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121124',
    borderRadius: 50, // Pílula arredondada como na imagem
    borderWidth: 1,
    borderColor: '#1e1c38',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1833',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolTextContainer: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  toolSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
});