package org.example.duan.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "VaiTro")
public class VaiTro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idVaiTro")
    private Integer idVaiTro;

    @Column(name = "tenVaiTro", nullable = false)
    private String tenVaiTro;
} 