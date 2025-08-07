package org.example.duan.Entity;

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
@Table(name = "KichCo")
public class KichCo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idKichCo;

    @Column(name = "kichCo", nullable = false)
    private String kichCo;

//    @OneToMany(mappedBy = "kichCo")
//    private List<ChiTietSanPham> chiTietSanPhams;
} 