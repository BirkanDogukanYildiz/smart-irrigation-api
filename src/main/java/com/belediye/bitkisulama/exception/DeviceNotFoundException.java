package com.belediye.bitkisulama.exception;

public class DeviceNotFoundException extends RuntimeException {
    // extends RuntimeException : Bu sayede sınıf RuntimeException'ın bir
    // alt sınıfı olmuş olur
    // RuntimeException'dan türemiş her şey unchecked exception'dır.
    // Yani DeviceNotFoundException bir unchecked exception.
    // throw veya try-catch zorunlu değil.
    // Neden Exception seçmedik; çünkü her yere throw veya try-catch gelsin
    // istemedik. Kodu temiz tuttuk.

    public DeviceNotFoundException(Long id) {
        super(id + " numaralı cihaz bulunamadı!");
        // Bu bir constructor. Yani new DeviceNotFoundException(5L) dediğinde
        // çalışan kod burası.
        // Parametre olarak Long id alıyor — hangi cihazın bulunamadığını
        // bilmek istiyoruz ki hata mesajında gösterelim.
        // super(id + " numaralı cihaz bulunamadı!")
        // super(...), üst sınıfın (RuntimeException'ın) constructor'ını çağırmak demek.
        // RuntimeException'ın (aslında en temelde Throwable'ın) içinde bir message alanı
        // var — her exception'ın taşıdığı o hata mesajı. getMessage() dediğinde dönen
        // değer bu.
        // Yani biz burada, mesajı hazır olarak üst sınıfa "paketleyip" gönderiyoruz.
        // Örnek: new DeviceNotFoundException(5L) çağrıldığında,
        // mesaj otomatik olarak "5 numaralı cihaz bulunamadı!" oluyor.
    }
}