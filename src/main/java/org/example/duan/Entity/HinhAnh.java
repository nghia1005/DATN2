package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "HinhAnh")
public class HinhAnh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idHinhAnh;

    @Column(name = "tenHinhAnh", nullable = false)
    private String tenHinhAnh;

    @Column(name = "urlHinhAnh", nullable = false)
    private String urlHinhAnh;
} 