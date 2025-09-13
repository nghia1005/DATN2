package org.example.duan.Repository;

import org.example.duan.Entity.MomoTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MomoTransactionRepository extends JpaRepository<MomoTransaction, Long> {
    
    // Tìm theo orderId
    Optional<MomoTransaction> findByOrderId(String orderId);
    
    // Tìm theo transId từ MoMo
    Optional<MomoTransaction> findByTransId(String transId);
    
    // Tìm theo idHoaDon
    List<MomoTransaction> findByIdHoaDon(Long idHoaDon);
    
    // Tìm theo trạng thái
    List<MomoTransaction> findByTrangThai(String trangThai);
    
    // Tìm theo loại giao dịch
    List<MomoTransaction> findByLoaiGiaoDich(String loaiGiaoDich);
    
    // Tìm giao dịch chờ thanh toán
    @Query("SELECT m FROM MomoTransaction m WHERE m.trangThai = 'Chờ thanh toán'")
    List<MomoTransaction> findPendingTransactions();
    
    // Tìm giao dịch thành công
    @Query("SELECT m FROM MomoTransaction m WHERE m.trangThai = 'Thành công'")
    List<MomoTransaction> findSuccessfulTransactions();
    
    // Tìm giao dịch theo khoảng thời gian
    @Query("SELECT m FROM MomoTransaction m WHERE m.ngayTao BETWEEN :startDate AND :endDate")
    List<MomoTransaction> findByDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                         @Param("endDate") java.time.LocalDateTime endDate);
    
    // Đếm số giao dịch theo trạng thái
    long countByTrangThai(String trangThai);
    
    // Đếm số giao dịch theo loại
    long countByLoaiGiaoDich(String loaiGiaoDich);
    
    // Tìm giao dịch gần nhất theo loại
    Optional<MomoTransaction> findTopByLoaiGiaoDichOrderByIdMomoTransactionDesc(String loaiGiaoDich);
}
