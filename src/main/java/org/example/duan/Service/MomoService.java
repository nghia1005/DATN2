package org.example.duan.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.duan.config.MomoConfig;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoService {

    private final MomoConfig momoConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MomoPaymentResponse createPayment(String orderId, BigDecimal amount, String orderInfo) {
        return createPaymentWithCustomRedirect(orderId, amount, orderInfo, momoConfig.getRedirectUrl());
    }

    public MomoPaymentResponse createPaymentWithCustomRedirect(String orderId, BigDecimal amount, String orderInfo, String redirectUrl) {
        try {
            // Tạo request data
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("partnerCode", momoConfig.getPartnerCode());
            requestData.put("partnerName", "SoleKing Store");
            requestData.put("storeId", momoConfig.getPartnerCode());
            requestData.put("requestId", orderId);
            requestData.put("amount", amount.longValue());
            requestData.put("orderId", orderId);
            requestData.put("orderInfo", orderInfo);
            requestData.put("redirectUrl", redirectUrl);
            requestData.put("ipnUrl", momoConfig.getIpnUrl());
            requestData.put("lang", "vi");
            requestData.put("requestType", momoConfig.getRequestType());
            requestData.put("autoCapture", true);
            requestData.put("extraData", "");

            // Tạo signature
            String signature = createSignature(requestData);
            requestData.put("signature", signature);

            log.info("MoMo request data: {}", objectMapper.writeValueAsString(requestData));

            // Gọi API MoMo
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);
            
            ResponseEntity<MomoPaymentResponse> response = restTemplate.postForEntity(
                momoConfig.getApiEndpoint(),
                entity,
                MomoPaymentResponse.class
            );

            log.info("MoMo response: {}", objectMapper.writeValueAsString(response.getBody()));

            return response.getBody();

        } catch (Exception e) {
            log.error("Error calling MoMo API", e);
            throw new RuntimeException("Lỗi khi gọi API MoMo: " + e.getMessage());
        }
    }

    private String createSignature(Map<String, Object> data) {
        try {
            // Tạo raw signature theo format MoMo
            String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                momoConfig.getAccessKey(),
                data.get("amount"),
                data.get("extraData"),
                data.get("ipnUrl"),
                data.get("orderId"),
                data.get("orderInfo"),
                data.get("partnerCode"),
                data.get("redirectUrl"),
                data.get("requestId"),
                data.get("requestType")
            );

            log.info("Raw signature: {}", rawSignature);

            // Tạo HMAC SHA256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                momoConfig.getSecretKey().getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(rawSignature.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            String signature = hexString.toString();
            log.info("Generated signature: {}", signature);
            
            return signature;

        } catch (Exception e) {
            log.error("Error creating signature", e);
            throw new RuntimeException("Lỗi tạo signature: " + e.getMessage());
        }
    }

    // Verify signature từ callback
    public boolean verifySignature(Map<String, String> params) {
        try {
            String receivedSignature = params.get("signature");
            if (receivedSignature == null) {
                return false;
            }

            // Tạo raw signature để verify
            String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                momoConfig.getAccessKey(),
                params.get("amount"),
                params.get("extraData"),
                params.get("message"),
                params.get("orderId"),
                params.get("orderInfo"),
                params.get("orderType"),
                params.get("partnerCode"),
                params.get("payType"),
                params.get("requestId"),
                params.get("responseTime"),
                params.get("resultCode"),
                params.get("transId")
            );

            // Tạo signature để so sánh
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                momoConfig.getSecretKey().getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(rawSignature.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            String calculatedSignature = hexString.toString();
            
            return calculatedSignature.equals(receivedSignature);

        } catch (Exception e) {
            log.error("Error verifying signature", e);
            return false;
        }
    }

    // DTO cho response từ MoMo
    public static class MomoPaymentResponse {
        public String partnerCode;
        public String orderId;
        public String requestId;
        public Long amount;
        public Long responseTime;
        public String message;
        public String resultCode;
        public String payUrl;
        public String shortLink;
        public String deeplink;
        public String qrCodeUrl;
        public String deeplinkMiniApp;

        // Getters and setters
        public String getPartnerCode() { return partnerCode; }
        public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }
        
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        
        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        
        public Long getResponseTime() { return responseTime; }
        public void setResponseTime(Long responseTime) { this.responseTime = responseTime; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getResultCode() { return resultCode; }
        public void setResultCode(String resultCode) { this.resultCode = resultCode; }
        
        public String getPayUrl() { return payUrl; }
        public void setPayUrl(String payUrl) { this.payUrl = payUrl; }
        
        public String getShortLink() { return shortLink; }
        public void setShortLink(String shortLink) { this.shortLink = shortLink; }
        
        public String getDeeplink() { return deeplink; }
        public void setDeeplink(String deeplink) { this.deeplink = deeplink; }
        
        public String getQrCodeUrl() { return qrCodeUrl; }
        public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
        
        public String getDeeplinkMiniApp() { return deeplinkMiniApp; }
        public void setDeeplinkMiniApp(String deeplinkMiniApp) { this.deeplinkMiniApp = deeplinkMiniApp; }
    }
}
