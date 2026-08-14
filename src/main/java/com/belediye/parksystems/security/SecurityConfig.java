package com.belediye.parksystems.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                          CustomAccessDeniedHandler customAccessDeniedHandler,
                          UserDetailsService userDetailsService,
                          PasswordEncoder passwordEncoder) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint) // token yok/geçersiz -> düzgün 401 JSON
                        .accessDeniedHandler(customAccessDeniedHandler)         // rol yetersiz -> düzgün 403 JSON
                )
                .authorizeHttpRequests(auth -> auth
                        // Log sistemi geliştirmesi: "Çıkış yapıldı" olayını GERÇEK kullanıcı adıyla
                        // kaydedebilmek için bu tek path, genel /api/auth/** permitAll kuralından
                        // ÖNCE (daha spesifik olarak) authenticated() ile işaretlendi. Sıra önemli:
                        // Spring Security kuralları yukarıdan aşağı, ilk eşleşen kazanır mantığıyla
                        // çalışır. Login akışı ve diğer /api/auth/** uçları hâlâ herkese açık.
                        .requestMatchers("/api/auth/logout").authenticated()

                        // Herkese açık uç noktalar
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Faz 6-A: Vatandaşa açık, kimlik doğrulama gerektirmeyen şeffaflık özeti.
                        .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").hasAnyRole("ADMIN", "GARDENER", "HEADGARDENER")
                        .requestMatchers("/api/logs/**").hasAnyRole("ADMIN", "HEADGARDENER")

                        // Raporlama/export: logs.csv aynı loglar kısıtına tabi (ADMIN+HEADGARDENER),
                        // diğer export'lar (bölge/cihaz/arıza/dashboard) kendi kaynaklarıyla aynı
                        // kısıta tabi (ADMIN+GARDENER+HEADGARDENER). Sıra önemli: spesifik kural
                        // (logs.csv) genel "/api/export/**" kuralından ÖNCE gelmeli.
                        .requestMatchers(HttpMethod.GET, "/api/export/logs.csv").hasAnyRole("ADMIN", "HEADGARDENER")
                        .requestMatchers(HttpMethod.GET, "/api/export/**").hasAnyRole("ADMIN", "GARDENER", "HEADGARDENER")

                        // --- React (Vite build) statik dosyaları ---
                        .requestMatchers(
                                "/", "/index.html", "/favicon.ico",
                                "/assets/**",
                                "/*.html", "/*.css", "/*.js",
                                "/*.svg", "/*.png", "/*.ico", "/*.json"
                        ).permitAll()

                        // React Router (client-side routing) sayfaları
                        .requestMatchers("/giris", "/harita", "/cihazlar/**", "/bolgeler/**", "/kullanicilar", "/loglar", "/seffaflik")
                        .permitAll()

                        // Kullanıcı yönetimi sadece ADMIN
                        .requestMatchers("/api/user/**").hasRole("ADMIN")

                        // Bölge: okuma her role açık (görünürlük servis katmanında filtrelenir),
                        // yazma (oluşturma/güncelleme/silme/baş bahçivan atama) SADECE ADMIN.
                        .requestMatchers(HttpMethod.GET, "/api/region/**").hasAnyRole("ADMIN", "GARDENER", "HEADGARDENER")
                        .requestMatchers("/api/region/**").hasRole("ADMIN")

                        // Sulama cihazları: okuma her iki role açık
                        .requestMatchers(HttpMethod.GET, "/api/devices/**").hasAnyRole("ADMIN", "GARDENER", "HEADGARDENER")
                        // Status güncelleme (arızalı/çalışıyor işaretleme): ADMIN + GARDENER
                        .requestMatchers(HttpMethod.PUT, "/api/devices/status/**").hasAnyRole("ADMIN", "GARDENER", "HEADGARDENER")

                        // Bakım kayıtları: ekleme + görüntüleme, cihaz durumu güncellemeyle aynı
                        // rol seti (sahadaki bahçivanın günlük operasyonel işi).
                        .requestMatchers("/api/maintenance/**").hasAnyRole("ADMIN", "GARDENER", "HEADGARDENER")
                        // Cihaz ekleme/silme/tam güncelleme: sadece ADMIN
                        .requestMatchers("/api/devices/**").hasAnyRole("ADMIN", "HEADGARDENER")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
