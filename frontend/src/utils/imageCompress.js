// Arıza fotoğrafı, ayrı bir dosya sunucusu/S3 kurulumu olmadan doğrudan backend'e
// data-URL (base64) olarak gönderiliyor (bkz. SprinklerInfo.photoBase64). Ham telefon
// fotoğrafları birkaç MB olabildiğinden, göndermeden önce tarayıcıda <canvas> ile
// yeniden boyutlandırıp JPEG'e sıkıştırıyoruz — hem istek boyutunu makul tutuyor hem
// de DB'de gereksiz yere şişmesini önlüyor.
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;
const MAX_ORIGINAL_FILE_BYTES = 15 * 1024 * 1024; // 15MB — bunun üstünü baştan reddet

export function compressImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Lütfen bir resim dosyası seçin."));
      return;
    }
    if (file.size > MAX_ORIGINAL_FILE_BYTES) {
      reject(new Error("Dosya çok büyük (maksimum 15MB)."));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Resim okunamadı."));
    };
    img.src = objectUrl;
  });
}
