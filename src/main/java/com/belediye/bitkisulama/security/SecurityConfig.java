package com.belediye.bitkisulama.security;

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
                        // Herkese açık uç noktalar
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").hasAnyRole("ADMIN", "GARDENER", "HEADGARDENER")
                        .requestMatchers("/api/logs/**").hasAnyRole("ADMIN", "HEADGARDENER")
                        .requestMatchers("/", "/*.html", "/*.css", "/*.js", "/favicon.ico").permitAll()

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
