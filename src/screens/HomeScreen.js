import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0914" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cabeçalho */}
        <Text style={styles.brandTag}>TELAFIT</Text>
        <Text style={styles.mainTitle}>Suas imagens, do jeito certo em cada tela</Text>
        <Text style={styles.subTitle}>
          Tudo é processado no seu dispositivo — nada é enviado para servidores.
        </Text>

        {/* Card Destaque (Otimização Automática) */}
        <TouchableOpacity 
          style={styles.featuredCard} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AutoOptimize')}
        >
          <View style={styles.featuredIconContainer}>
            <Text style={styles.featuredIconText}>🪄</Text>
          </View>
          <Text style={styles.featuredTitle}>Otimização automática</Text>
          <Text style={styles.featuredDesc}>
            Adicione as imagens, escolha o objetivo e deixe o app decidir resolução, formato e qualidade.
          </Text>
        </TouchableOpacity>

        {/* Seção Ferramentas */}
        <Text style={styles.sectionHeader}>FERRAMENTAS</Text>

        {/* Lista de Cards Secundários */}
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('DevicePresets')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📱</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Tela & dispositivos</Text>
            <Text style={styles.cardSubtitle}>Celular, tablet, monitor, TV, console</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Compress')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📉</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Compressão</Text>
            <Text style={styles.cardSubtitle}>Qualidade fixa ou "reduzir para X MB"</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Convert')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🔄</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Converter formato</Text>
            <Text style={styles.cardSubtitle}>JPG · PNG · WebP · AVIF</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Crop')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✂️</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Corte inteligente</Text>
            <Text style={styles.cardSubtitle}>1:1, 16:9, Instagram, YouTube...</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Metadata')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🛡️</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Informações & privacidade</Text>
            <Text style={styles.cardSubtitle}>EXIF, GPS e remoção de metadados</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('BatchProcess')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📚</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Processamento em lote</Text>
            <Text style={styles.cardSubtitle}>Aplique regras para múltiplas imagens</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PrintCalculator')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🖨️</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Calculadora de Impressão</Text>
            <Text style={styles.cardSubtitle}>Dimensões físicas e cálculo de DPI</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0914',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  brandTag: {
    color: '#8A5CF5',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 12,
  },
  subTitle: {
    color: '#9E9AA8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },
  featuredCard: {
    backgroundColor: '#8257E5',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#8257E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredIconContainer: {
    marginBottom: 12,
  },
  featuredIconText: {
    fontSize: 28,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  featuredDesc: {
    color: '#E1D8F9',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    color: '#6F6A7E',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#120F24',
    borderWidth: 1,
    borderColor: '#1E1938',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1C1635',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#7D788B',
    fontSize: 13,
  },
});