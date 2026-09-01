import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

// Salva um lote de imagens (URIs locais) em um álbum, criando-o se necessário
export async function saveImagesToGallery(uris, albumName = 'TELAFIT') {
  if (!uris || uris.length === 0) {
    throw new Error('Nenhuma imagem para salvar.');
  }

  // writeOnly precisa ser false: getAlbumAsync exige permissão de leitura
  const { status } = await MediaLibrary.requestPermissionsAsync(false);
  if (status !== 'granted') {
    const permissionError = new Error('Precisamos de acesso à galeria para salvar as imagens.');
    permissionError.code = 'PERMISSION_DENIED';
    throw permissionError;
  }

  let album = await MediaLibrary.getAlbumAsync(albumName);
  let savedCount = 0;

  for (const uri of uris) {
    let localUri = uri;

    if (uri.startsWith('http')) {
      const filename = uri.split('/').pop() || `telafit_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      const downloadedFile = await FileSystem.downloadAsync(uri, fileUri);
      localUri = downloadedFile.uri;
    }

    if (album) {
      // Passar o álbum direto para createAssetAsync evita o diálogo de mover assets entre álbuns
      await MediaLibrary.createAssetAsync(localUri, album);
    } else {
      const asset = await MediaLibrary.createAssetAsync(localUri);
      album = await MediaLibrary.createAlbumAsync(albumName, asset, true);
    }

    savedCount += 1;
  }

  return savedCount;
}
