package org.example.todov1.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    // [추가] 로깅을 위한 Logger 객체
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs}")
    private int jwtExpirationInMs;

    // [추가] String인 jwtSecret을 기반으로 실제 암호화에 사용될 Key 객체
    private Key key;

    // [추가] 의존성 주입 후, 키를 생성하는 초기화 메서드
    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // JWT 토큰 생성
    public String generateToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationInMs))
                // [수정] String인 jwtSecret 대신, Key 객체인 key를 사용
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰에서 사용자 이름 추출
    public String getUsernameFromJwtToken(String token) {
        // [수정] 비권장(deprecated)된 parser() 대신 parserBuilder() 사용
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }

    // 토큰 유효성 검증
    public boolean validateJwtToken(String token) {
        try {
            // [수정] 비권장(deprecated)된 parser() 대신 parserBuilder() 사용
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}