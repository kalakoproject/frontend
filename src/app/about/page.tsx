import React from 'react';
import Image from 'next/image'; // Import komponen Image bawaan Next.js
import bebasImg from '../../../public/about.png';
import logoImg from '../../../public/logo1.png';

const About: React.FC = () => {
  return (
    <section id="about" className="w-full bg-slate-50 py-20 overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          
          {/* SISI KIRI: IMAGE COMPOSITION */}
          <div className="w-full lg:w-1/2 relative flex justify-center items-center">
            
            {/* Gambar Utama */}
            <div className="relative w-64 h-[400px] md:w-80 md:h-[500px] overflow-hidden rounded-[200px] border-8 border-white shadow-xl z-0">
              <Image 
                src={bebasImg}  // Static import memastikan path benar di build
                alt="Dashboard" 
                fill                  // Mengisi area div pembungkus
                sizes="(min-width: 1024px) 50vw, 90vw" // Beri hint ukuran untuk mode fill
                className="object-cover"
                priority              // Mempercepat loading gambar utama
              />
            </div>

            {/* Gambar Kedua */}
            <div className="absolute -bottom-10 -right-5 md:bottom-10 md:-right-10 w-48 h-48 md:w-72 md:h-72 overflow-hidden rounded-full border-8 border-white shadow-2xl z-10">
              <Image 
                src={logoImg}    // Static import memastikan path benar di build
                alt="Laporan" 
                fill
                sizes="(min-width: 1024px) 40vw, 60vw"
                className="object-cover"
              />
            </div>
          </div>
          
          {/* SISI KANAN: TEXT CONTENT */}
          <div className="w-full lg:w-1/2 flex flex-col space-y-6">
             <h2 className="text-5xl md:text-6xl font-light text-[#212529] leading-tight">
               Tentang <span className="font-bold">Kalako</span>
             </h2>
             <p className="text-gray-600 text-lg">
                Kalako ERP adalah solusi sistem manajemen
                terpadu berbasis cloud yang dirancang
                khusus untuk membantu UMKM dan bisnis
                retail di Indonesia dalam mengelola seluruh
                proses bisnis secara efisien mulai dari
                penjualan, pembelian, stok, keuangan, hingga
                laporan akuntansi
             </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;