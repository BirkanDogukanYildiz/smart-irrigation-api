package com.belediye.bitkisulama.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Header yoksa veya "Bearer " ile başlamıyorsa, token kontrolü yapmadan devam et
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); // "Bearer " kısmını at, sadece token kalsın

        // Token bozuk, süresi dolmuş ya da imzası geçersizse jjwt burada unchecked
        // bir exception fırlatır (ör. ExpiredJwtException, MalformedJwtException).
        // Bunu yakalamazsak istek 401 yerine ham bir 500 ile patlar. Böyle bir
        // durumda isteği "kimliksiz" (authentication set edilmeden) devam ettiriyoruz;
        // ilgili endpoint zaten korumalıysa Spring Security normal 401/403 akışını işletir.
        String username = null;
        try {
            username = jwtService.extractUsername(token);
        } catch (RuntimeException ex) {
            logger.debug("Geçersiz veya süresi dolmuş JWT token: " + ex.getMessage());
        }

        // Kullanıcı adı bulunduysa ve henüz kimse "giriş yapmış" olarak işaretlenmediyse
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(token, username)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Spring Security'ye "bu kullanıcı giriş yapmış" bilgisini kaydet
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}