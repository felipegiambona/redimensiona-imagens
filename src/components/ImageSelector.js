import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImageSelector({ images, setImages, allowsMultiple = true }) {
  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('É necessária permissão para acessar as fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: allowsMultiple,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickImages}>
        <Text style={styles.buttonText}>
          {images.length > 0 
            ? `📸 ${images.length} imagem(ns) selecionada(s)` 
            : '🖼️ Selecionar da Galeria'}
        </Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewContainer}>
          {images.map((img, index) => (
            <Image key={index} source={{ uri: img.uri }} style={styles.previewImage} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  button: { backgroundColor: '#007aff', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  previewContainer: { flexDirection: 'row', marginTop: 12 },
  previewImage: { width: 70, height: 70, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' }
});