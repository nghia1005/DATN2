package org.example.duan.Controller;

import lombok.RequiredArgsConstructor;
import org.example.duan.DTO.MomoTransactionDTO;
import org.example.duan.Service.MomoTransactionService;
import org.example.duan.Service.MomoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/momo")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MomoTransactionController {

    private final MomoTransactionService momoTransactionService;
    private final MomoService momoService;

    // Tạo giao dịch MoMo mới
    @PostMapping("/create")
    public ResponseEntity<?> createMomoTransaction(@RequestBody CreateMomoTransactionRequest request) {
        try {
            MomoTransactionDTO transaction = momoTransactionService.createMomoTransaction(
                request.getIdHoaDon(),
                request.getAmount(),
                request.getLoaiGiaoDich()
            );
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tạo giao dịch MoMo thành công",
                "data", transaction
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi tạo giao dịch MoMo: " + e.getMessage()
            ));
        }
    }

    // Tạo giao dịch MoMo mới với redirect URL tùy chỉnh (cho shop)
    @PostMapping("/create-shop")
    public ResponseEntity<?> createMomoTransactionForShop(@RequestBody CreateMomoTransactionRequest request) {
        try {
            MomoTransactionDTO transaction = momoTransactionService.createMomoTransactionForShop(
                request.getAmount(),
                request.getOrderInfo(),
                request.getReturnUrl()
            );
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tạo giao dịch MoMo thành công",
                "data", transaction
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi tạo giao dịch MoMo: " + e.getMessage()
            ));
        }
    }

    // Callback từ MoMo (webhook) - nhận form data
    @PostMapping("/callback")
    public ResponseEntity<?> handleMomoCallback(@RequestParam Map<String, String> params) {
        try {
            // Verify signature từ MoMo
            if (!momoService.verifySignature(params)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid signature"
                ));
            }

            // Lấy thông tin từ callback
            String orderId = params.get("orderId");
            String transId = params.get("transId");
            Integer resultCode = Integer.parseInt(params.get("resultCode"));
            String message = params.get("message");

            MomoTransactionDTO transaction = momoTransactionService.updateTransactionStatus(
                orderId, transId, resultCode, message
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật trạng thái thành công",
                "data", transaction
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi xử lý callback: " + e.getMessage()
            ));
        }
    }

    // Lấy tất cả giao dịch
    @GetMapping("/transactions")
    public ResponseEntity<List<MomoTransactionDTO>> getAllTransactions() {
        List<MomoTransactionDTO> transactions = momoTransactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    // Lấy giao dịch theo ID
    @GetMapping("/transactions/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        return momoTransactionService.getTransactionById(id)
                .map(transaction -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", transaction
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // Lấy giao dịch theo orderId
    @GetMapping("/transactions/order/{orderId}")
    public ResponseEntity<?> getTransactionByOrderId(@PathVariable String orderId) {
        return momoTransactionService.getTransactionByOrderId(orderId)
                .map(transaction -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", transaction
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // Lấy giao dịch theo hóa đơn
    @GetMapping("/transactions/invoice/{idHoaDon}")
    public ResponseEntity<List<MomoTransactionDTO>> getTransactionsByInvoiceId(@PathVariable Long idHoaDon) {
        List<MomoTransactionDTO> transactions = momoTransactionService.getTransactionsByInvoiceId(idHoaDon);
        return ResponseEntity.ok(transactions);
    }

    // Lấy giao dịch theo trạng thái
    @GetMapping("/transactions/status/{trangThai}")
    public ResponseEntity<List<MomoTransactionDTO>> getTransactionsByStatus(@PathVariable String trangThai) {
        List<MomoTransactionDTO> transactions = momoTransactionService.getTransactionsByStatus(trangThai);
        return ResponseEntity.ok(transactions);
    }

    // Lấy giao dịch theo loại (Tại quầy/Online)
    @GetMapping("/transactions/type/{loaiGiaoDich}")
    public ResponseEntity<List<MomoTransactionDTO>> getTransactionsByType(@PathVariable String loaiGiaoDich) {
        List<MomoTransactionDTO> transactions = momoTransactionService.getTransactionsByType(loaiGiaoDich);
        return ResponseEntity.ok(transactions);
    }

    // Hủy giao dịch
    @PutMapping("/transactions/{orderId}/cancel")
    public ResponseEntity<?> cancelTransaction(@PathVariable String orderId) {
        try {
            MomoTransactionDTO transaction = momoTransactionService.cancelTransaction(orderId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Hủy giao dịch thành công",
                "data", transaction
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi hủy giao dịch: " + e.getMessage()
            ));
        }
    }

    // Thống kê giao dịch MoMo
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        try {
            MomoTransactionService.MomoStatistics stats = momoTransactionService.getStatistics();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "totalTransactions", stats.totalTransactions,
                    "pendingTransactions", stats.pendingTransactions,
                    "successfulTransactions", stats.successfulTransactions,
                    "failedTransactions", stats.failedTransactions,
                    "posTransactions", stats.posTransactions,
                    "onlineTransactions", stats.onlineTransactions
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi lấy thống kê: " + e.getMessage()
            ));
        }
    }

    // Kiểm tra trạng thái giao dịch (cho POS/Frontend polling)
    @GetMapping("/check-status/{orderId}")
    public ResponseEntity<?> checkTransactionStatus(@PathVariable String orderId) {
        return momoTransactionService.getTransactionByOrderId(orderId)
                .map(transaction -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", transaction.getTrangThai(),
                    "data", transaction
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // Liên kết hóa đơn với giao dịch MoMo
    @PostMapping("/link-invoice/{orderId}/{idHoaDon}")
    public ResponseEntity<?> linkInvoiceToTransaction(@PathVariable String orderId, @PathVariable Long idHoaDon) {
        try {
            MomoTransactionDTO transaction = momoTransactionService.linkInvoiceToTransaction(orderId, idHoaDon);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Liên kết hóa đơn thành công",
                "data", transaction
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi liên kết hóa đơn: " + e.getMessage()
            ));
        }
    }

    // API để test/mô phỏng thanh toán thành công (chỉ dùng cho dev/test)
    @PostMapping("/test-success/{orderId}")
    public ResponseEntity<?> testPaymentSuccess(@PathVariable String orderId) {
        try {
            // Mô phỏng callback thành công từ MoMo
            String mockTransId = "MOMO_TEST_" + System.currentTimeMillis();
            
            MomoTransactionDTO transaction = momoTransactionService.updateTransactionStatus(
                orderId,
                mockTransId,
                0, // resultCode = 0 nghĩa là thành công
                "Thanh toán thành công"
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test thanh toán thành công",
                "data", transaction
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi test thanh toán: " + e.getMessage()
            ));
        }
    }

    // Lấy giao dịch MoMo gần nhất cho loại Online
    @GetMapping("/recent-online")
    public ResponseEntity<?> getRecentOnlineTransaction() {
        try {
            MomoTransactionDTO result = momoTransactionService.getRecentOnlineTransaction();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Lấy giao dịch gần nhất thành công",
                "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi lấy giao dịch: " + e.getMessage()
            ));
        }
    }

    // DTO cho tạo giao dịch
    public static class CreateMomoTransactionRequest {
        private Long idHoaDon;
        private BigDecimal amount;
        private String loaiGiaoDich; // "Tại quầy" hoặc "Online"
        private String orderInfo; // Thông tin đơn hàng
        private String returnUrl; // URL redirect tùy chỉnh

        // Getters and Setters
        public Long getIdHoaDon() { return idHoaDon; }
        public void setIdHoaDon(Long idHoaDon) { this.idHoaDon = idHoaDon; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getLoaiGiaoDich() { return loaiGiaoDich; }
        public void setLoaiGiaoDich(String loaiGiaoDich) { this.loaiGiaoDich = loaiGiaoDich; }
        public String getOrderInfo() { return orderInfo; }
        public void setOrderInfo(String orderInfo) { this.orderInfo = orderInfo; }
        public String getReturnUrl() { return returnUrl; }
        public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
    }

    // DTO cho callback MoMo
    public static class MomoCallbackRequest {
        private String orderId;
        private String transId;
        private Integer resultCode;
        private String message;

        // Getters and Setters
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getTransId() { return transId; }
        public void setTransId(String transId) { this.transId = transId; }
        public Integer getResultCode() { return resultCode; }
        public void setResultCode(Integer resultCode) { this.resultCode = resultCode; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
