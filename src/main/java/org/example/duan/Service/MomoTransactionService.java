package org.example.duan.Service;

import lombok.RequiredArgsConstructor;
import org.example.duan.DTO.MomoTransactionDTO;
import org.example.duan.Entity.HoaDon;
import org.example.duan.Entity.MomoTransaction;
import org.example.duan.Repository.HoaDonRepository;
import org.example.duan.Repository.MomoTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MomoTransactionService {
    private static final Logger logger = LoggerFactory.getLogger(MomoTransactionService.class);

    private final MomoTransactionRepository momoTransactionRepository;
    private final HoaDonRepository hoaDonRepository;
    private final MomoService momoService;

    @Transactional
    public MomoTransactionDTO createMomoTransaction(Long idHoaDon, BigDecimal amount, String loaiGiaoDich) {
        // Tạo orderId duy nhất
        String orderId = generateOrderId(loaiGiaoDich);
        
        MomoTransaction transaction = new MomoTransaction();
        transaction.setIdHoaDon(idHoaDon);
        transaction.setOrderId(orderId);
        transaction.setAmount(amount);
        String orderInfo = "Thanh toán đơn hàng " + (idHoaDon != null ? "#" + idHoaDon : "");
        transaction.setOrderInfo(orderInfo);
        transaction.setTrangThai("Chờ thanh toán");
        transaction.setLoaiGiaoDich(loaiGiaoDich);
        
        // Gọi API MoMo thực tế
        try {
            MomoService.MomoPaymentResponse momoResponse = momoService.createPayment(orderId, amount, orderInfo);
            
            if ("0".equals(momoResponse.getResultCode())) {
                // Thành công
                transaction.setPayUrl(momoResponse.getPayUrl());
                transaction.setQrCodeUrl(momoResponse.getQrCodeUrl());
                transaction.setMessage(momoResponse.getMessage());
                transaction.setResultCode(Integer.parseInt(momoResponse.getResultCode()));
            } else {
                // Lỗi từ MoMo
                transaction.setTrangThai("Thất bại");
                transaction.setMessage(momoResponse.getMessage());
                transaction.setResultCode(Integer.parseInt(momoResponse.getResultCode()));
            }
        } catch (Exception e) {
            // Lỗi kết nối hoặc lỗi khác
            transaction.setTrangThai("Thất bại");
            transaction.setMessage("Lỗi kết nối MoMo: " + e.getMessage());
            transaction.setResultCode(-1);
        }
        
        MomoTransaction saved = momoTransactionRepository.save(transaction);
        return convertToDTO(saved);
    }

    // Tạo giao dịch MoMo cho shop với redirect URL tùy chỉnh
    @Transactional
    public MomoTransactionDTO createMomoTransactionForShop(BigDecimal amount, String orderInfo, String returnUrl) {
        // Tạo orderId duy nhất
        String orderId = generateOrderId("Online");
        
        MomoTransaction transaction = new MomoTransaction();
        transaction.setIdHoaDon(null); // Chưa có hóa đơn
        transaction.setOrderId(orderId);
        transaction.setAmount(amount);
        transaction.setOrderInfo(orderInfo != null ? orderInfo : "Thanh toán đơn hàng online");
        transaction.setTrangThai("Chờ thanh toán");
        transaction.setLoaiGiaoDich("Online");
        
        // Gọi API MoMo thực tế với redirect URL tùy chỉnh
        try {
            MomoService.MomoPaymentResponse momoResponse = momoService.createPaymentWithCustomRedirect(orderId, amount, orderInfo, returnUrl);
            
            if ("0".equals(momoResponse.getResultCode())) {
                // Thành công
                transaction.setPayUrl(momoResponse.getPayUrl());
                transaction.setQrCodeUrl(momoResponse.getQrCodeUrl());
                transaction.setMessage(momoResponse.getMessage());
                transaction.setResultCode(Integer.parseInt(momoResponse.getResultCode()));
            } else {
                // Lỗi từ MoMo
                transaction.setTrangThai("Thất bại");
                transaction.setMessage(momoResponse.getMessage());
                transaction.setResultCode(Integer.parseInt(momoResponse.getResultCode()));
            }
        } catch (Exception e) {
            // Lỗi kết nối hoặc lỗi khác
            transaction.setTrangThai("Thất bại");
            transaction.setMessage("Lỗi kết nối MoMo: " + e.getMessage());
            transaction.setResultCode(-1);
        }
        
        MomoTransaction saved = momoTransactionRepository.save(transaction);
        return convertToDTO(saved);
    }

    // Cập nhật trạng thái giao dịch từ callback MoMo
    @Transactional
    public MomoTransactionDTO updateTransactionStatus(String orderId, String transId, 
                                                     Integer resultCode, String message) {
        Optional<MomoTransaction> optionalTransaction = momoTransactionRepository.findByOrderId(orderId);
        
        if (optionalTransaction.isPresent()) {
            MomoTransaction transaction = optionalTransaction.get();
            transaction.setTransId(transId);
            transaction.setResultCode(resultCode);
            transaction.setMessage(message);
            
            // Cập nhật trạng thái dựa trên resultCode
            if (resultCode != null && resultCode == 0) {
                transaction.setTrangThai("Thành công");
                // Cập nhật trạng thái hóa đơn nếu đã liên kết
                if (transaction.getIdHoaDon() != null) {
                    updateInvoiceStatus(transaction.getIdHoaDon(), "Đã thanh toán");
                }
            } else {
                transaction.setTrangThai("Thất bại");
            }
            
            MomoTransaction updated = momoTransactionRepository.save(transaction);
            return convertToDTO(updated);
        }
        
        throw new RuntimeException("Không tìm thấy giao dịch với orderId: " + orderId);
    }

    // Cập nhật idHoaDon cho giao dịch MoMo sau khi tạo hóa đơn
    @Transactional
    public MomoTransactionDTO linkInvoiceToTransaction(String orderId, Long idHoaDon) {
        Optional<MomoTransaction> optionalTransaction = momoTransactionRepository.findByOrderId(orderId);
        
        if (optionalTransaction.isPresent()) {
            MomoTransaction transaction = optionalTransaction.get();
            transaction.setIdHoaDon(idHoaDon);
            
            // Không cập nhật trạng thái hóa đơn - để frontend tự quản lý
            // Hóa đơn sẽ giữ nguyên trạng thái "Chờ xác nhận" từ frontend
            logger.info("ℹ️ Giữ nguyên trạng thái hóa đơn {} từ frontend", idHoaDon);
            
            MomoTransaction updated = momoTransactionRepository.save(transaction);
            logger.info("✅ Đã link hóa đơn {} với MoMo transaction {}", idHoaDon, orderId);
            return convertToDTO(updated);
        }
        
        logger.error("❌ Không tìm thấy giao dịch với orderId: {}", orderId);
        throw new RuntimeException("Không tìm thấy giao dịch với orderId: " + orderId);
    }

    // Lấy tất cả giao dịch
    public List<MomoTransactionDTO> getAllTransactions() {
        return momoTransactionRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy giao dịch theo ID
    public Optional<MomoTransactionDTO> getTransactionById(Long id) {
        return momoTransactionRepository.findById(id)
                .map(this::convertToDTO);
    }

    // Lấy giao dịch theo orderId
    public Optional<MomoTransactionDTO> getTransactionByOrderId(String orderId) {
        return momoTransactionRepository.findByOrderId(orderId)
                .map(this::convertToDTO);
    }

    // Lấy giao dịch theo hóa đơn
    public List<MomoTransactionDTO> getTransactionsByInvoiceId(Long idHoaDon) {
        return momoTransactionRepository.findByIdHoaDon(idHoaDon)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy giao dịch theo trạng thái
    public List<MomoTransactionDTO> getTransactionsByStatus(String trangThai) {
        return momoTransactionRepository.findByTrangThai(trangThai)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy giao dịch theo loại
    public List<MomoTransactionDTO> getTransactionsByType(String loaiGiaoDich) {
        return momoTransactionRepository.findByLoaiGiaoDich(loaiGiaoDich)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Hủy giao dịch
    @Transactional
    public MomoTransactionDTO cancelTransaction(String orderId) {
        Optional<MomoTransaction> optionalTransaction = momoTransactionRepository.findByOrderId(orderId);
        
        if (optionalTransaction.isPresent()) {
            MomoTransaction transaction = optionalTransaction.get();
            if ("Chờ thanh toán".equals(transaction.getTrangThai())) {
                transaction.setTrangThai("Đã hủy");
                MomoTransaction updated = momoTransactionRepository.save(transaction);
                return convertToDTO(updated);
            } else {
                throw new RuntimeException("Không thể hủy giao dịch đã hoàn tất");
            }
        }
        
        throw new RuntimeException("Không tìm thấy giao dịch với orderId: " + orderId);
    }

    // Thống kê giao dịch
    public MomoStatistics getStatistics() {
        long totalTransactions = momoTransactionRepository.count();
        long pendingTransactions = momoTransactionRepository.countByTrangThai("Chờ thanh toán");
        long successfulTransactions = momoTransactionRepository.countByTrangThai("Thành công");
        long failedTransactions = momoTransactionRepository.countByTrangThai("Thất bại");
        long posTransactions = momoTransactionRepository.countByLoaiGiaoDich("Tại quầy");
        long onlineTransactions = momoTransactionRepository.countByLoaiGiaoDich("Online");
        
        return new MomoStatistics(totalTransactions, pendingTransactions, successfulTransactions, 
                                 failedTransactions, posTransactions, onlineTransactions);
    }

    // Cập nhật trạng thái hóa đơn
    private void updateInvoiceStatus(Long idHoaDon, String trangThai) {
        if (idHoaDon != null) {
            Optional<HoaDon> optionalHoaDon = hoaDonRepository.findById(idHoaDon);
            if (optionalHoaDon.isPresent()) {
                HoaDon hoaDon = optionalHoaDon.get();
                hoaDon.setTrangThai(trangThai);
                hoaDonRepository.save(hoaDon);
            }
        }
    }

    // Cập nhật trạng thái hóa đơn chỉ khi cần thiết
    private void updateInvoiceStatusIfNeeded(Long idHoaDon, String trangThaiMoi) {
        if (idHoaDon != null) {
            Optional<HoaDon> optionalHoaDon = hoaDonRepository.findById(idHoaDon);
            if (optionalHoaDon.isPresent()) {
                HoaDon hoaDon = optionalHoaDon.get();
                String trangThaiHienTai = hoaDon.getTrangThai();
                
                // Chỉ cập nhật nếu trạng thái hiện tại là "Chờ xác nhận" hoặc "Chờ thanh toán"
                if ("Chờ xác nhận".equals(trangThaiHienTai) || "Chờ thanh toán".equals(trangThaiHienTai)) {
                    hoaDon.setTrangThai(trangThaiMoi);
                    hoaDonRepository.save(hoaDon);
                    logger.info("✅ Đã cập nhật trạng thái hóa đơn {} từ '{}' thành '{}'", idHoaDon, trangThaiHienTai, trangThaiMoi);
                } else {
                    logger.info("ℹ️ Giữ nguyên trạng thái hóa đơn {}: '{}'", idHoaDon, trangThaiHienTai);
                }
            }
        }
    }

    // Tạo orderId duy nhất
    private String generateOrderId(String loaiGiaoDich) {
        String prefix = "Online".equals(loaiGiaoDich) ? "ORDER_ONLINE_" : "ORDER_POS_";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + timestamp + "_" + System.nanoTime() % 1000;
    }

    // Tạo MoMo Pay URL (mô phỏng - thực tế sẽ gọi API MoMo)
    private String generateMomoPayUrl(MomoTransaction transaction) {
        // Trong thực tế, đây sẽ là URL trả về từ MoMo API
        // Ví dụ: https://payment.momo.vn/v2/gateway/pay?t=<encrypted_data>
        
        // Mô phỏng URL thanh toán MoMo
        return String.format("https://test-payment.momo.vn/v2/gateway/pay?partnerCode=MOMO&orderId=%s&amount=%s&orderInfo=%s&redirectUrl=%s&ipnUrl=%s",
            transaction.getOrderId(),
            transaction.getAmount().toString(),
            java.net.URLEncoder.encode(transaction.getOrderInfo(), java.nio.charset.StandardCharsets.UTF_8),
            java.net.URLEncoder.encode("http://localhost:3002/pos", java.nio.charset.StandardCharsets.UTF_8),
            java.net.URLEncoder.encode("http://localhost:8080/api/momo/callback", java.nio.charset.StandardCharsets.UTF_8)
        );
    }

    // Chuyển đổi Entity sang DTO
    private MomoTransactionDTO convertToDTO(MomoTransaction transaction) {
        MomoTransactionDTO dto = new MomoTransactionDTO();
        dto.setIdMomoTransaction(transaction.getIdMomoTransaction());
        dto.setIdHoaDon(transaction.getIdHoaDon());
        dto.setOrderId(transaction.getOrderId());
        dto.setAmount(transaction.getAmount());
        dto.setOrderInfo(transaction.getOrderInfo());
        dto.setQrCodeUrl(transaction.getQrCodeUrl());
        dto.setPayUrl(transaction.getPayUrl());
        dto.setTransId(transaction.getTransId());
        dto.setResultCode(transaction.getResultCode());
        dto.setMessage(transaction.getMessage());
        dto.setTrangThai(transaction.getTrangThai());
        dto.setLoaiGiaoDich(transaction.getLoaiGiaoDich());
        dto.setNgayTao(transaction.getNgayTao());
        dto.setNgayCapNhat(transaction.getNgayCapNhat());
        
        // Thêm thông tin hóa đơn nếu có
        if (transaction.getHoaDon() != null) {
            dto.setMaHoaDon(transaction.getHoaDon().getMaHoaDon());
            dto.setTenNguoiNhan(transaction.getHoaDon().getTenNguoiNhan());
        }
        
        return dto;
    }

    public MomoTransactionDTO getRecentOnlineTransaction() {
        MomoTransaction transaction = momoTransactionRepository.findTopByLoaiGiaoDichOrderByIdMomoTransactionDesc("Online")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch MoMo Online gần nhất"));
        return convertToDTO(transaction);
    }

    // Inner class cho thống kê
    public static class MomoStatistics {
        public final long totalTransactions;
        public final long pendingTransactions;
        public final long successfulTransactions;
        public final long failedTransactions;
        public final long posTransactions;
        public final long onlineTransactions;

        public MomoStatistics(long totalTransactions, long pendingTransactions, 
                             long successfulTransactions, long failedTransactions,
                             long posTransactions, long onlineTransactions) {
            this.totalTransactions = totalTransactions;
            this.pendingTransactions = pendingTransactions;
            this.successfulTransactions = successfulTransactions;
            this.failedTransactions = failedTransactions;
            this.posTransactions = posTransactions;
            this.onlineTransactions = onlineTransactions;
        }
    }
}
