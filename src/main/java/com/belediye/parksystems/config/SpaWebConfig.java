package com.belediye.parksystems.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * React Router (client-side routing) kullanıldığı için, kullanıcı bir alt sayfaya
 * (ör. /cihazlar) doğrudan URL ile girdiğinde ya da sayfayı yenilediğinde tarayıcı
 * Spring'e gerçek bir GET isteği gönderir. Spring bu path'i bilmediği için normalde
 * 404 (NoResourceFoundException) döner ve beyaz sayfa görülür.
 *
 * Bu konfigürasyon, bilinen React Router path'lerini index.html'e yönlendirir;
 * index.html yüklenince React Router devralıp doğru sayfayı render eder.
 *
 * Not: Bu sadece sayfa kabuğunu (HTML) yönlendirir — herhangi bir API endpoint'ini,
 * rolü ya da veri erişimini etkilemez. Gerçek yetkilendirme hâlâ SecurityConfig'teki
 * /api/** kurallarında ve React tarafındaki rol bazlı route koruma mantığında uygulanır.
 *
 * "/seffaflik": Faz 6-A vatandaş görünümü sayfası, login gerektirmeden erişilir.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/giris").setViewName("forward:/index.html");
        registry.addViewController("/harita").setViewName("forward:/index.html");
        // /cihazlar/** ve /bolgeler/** : liste sayfasının yanında artık /cihazlar/:id ve
        // /bolgeler/:id detay sayfaları da var (paylaşılabilir URL'ler); wildcard pattern
        // ikisini de tek kuralla kapsıyor.
        registry.addViewController("/cihazlar/**").setViewName("forward:/index.html");
        registry.addViewController("/bolgeler/**").setViewName("forward:/index.html");
        registry.addViewController("/kullanicilar").setViewName("forward:/index.html");
        registry.addViewController("/loglar").setViewName("forward:/index.html");
        registry.addViewController("/seffaflik").setViewName("forward:/index.html");
    }
}
