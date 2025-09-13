package org.example.duan.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "DanhMuc")
public class DanhMuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDanhMuc;

    @Column(name = "tenDanhMuc", nullable = false)
    private String tenDanhMuc;

    @OneToMany(mappedBy = "danhMuc")
    @JsonIgnore
    private List<SanPham> sanPhams;

    // Getters và Setters
}
