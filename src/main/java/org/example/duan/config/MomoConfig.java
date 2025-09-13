package org.example.duan.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "momo")
@Getter
@Setter
public class MomoConfig {
    
    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String apiEndpoint;
    private String redirectUrl;
    private String shopRedirectUrl;
    private String ipnUrl;
    private String requestType;
    private String orderType;
}
