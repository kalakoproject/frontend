import React from 'react';

const HeroSection: React.FC = () => {
  return (
    /* 
       PENJELASAN PERUBAHAN:
       1. pt-20: Padding top untuk mobile (80px), cukup untuk menutupi tinggi navbar + jarak sedikit.
       2. lg:pt-32: Padding top untuk desktop (128px), jauh lebih kecil dari pt-48 sebelumnya.
       3. pb-10 / lg:pb-20: Mengurangi padding bawah agar section tidak terlalu memakan tempat.
    */
    <section className="relative w-full bg-white pt-20 pb-10 lg:pt-32 lg:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* SISI KIRI: TEXT & FORM */}
          <div className="w-full lg:w-1/2 flex flex-col space-y-6 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#212529] leading-tight relative">
              Kalako,  {' '}
              <span className="relative inline-block align-middle">
                <span className="relative z-10">Teman Pintar</span>
              </span>
              <br />
              <span className="relative inline-block">
                Usaha Kamu 
                {/* SVG coretan garis dua merah di bawah */}
                <br />
                <svg
                  className="absolute left-0 right-0 -bottom-7 w-[160%] h-15 pointer-events-none"
                  viewBox="0 0 500 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Garis spidol pertama */}
                  <path
                    d="M15 18 Q60 10 110 20 Q160 30 210 18 Q260 6 325 22"
                    stroke="#ef4444"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.85"
                    fill="none"
                  />
                  {/* Garis spidol kedua */}
                  <path
                    d="M20 32 Q80 28 140 34 Q200 40 260 30 Q300 24 320 36"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.5"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-gray-600 text-lg md:text-xl max-w-lg leading-relaxed">“Ngatur bisnis, jadi gampang!”
            </p>
          </div>

          {/* SISI KANAN: ILLUSTRATION */}
          <div className="w-full lg:w-1/2 relative flex justify-center items-center mt-8 lg:mt-0">
            <img 
              src="https://ubico.id/wp-content/uploads/2020/04/desktop.png" 
              alt="ERP Illustration" 
              className="w-full max-w-[400px] lg:max-w-[400px] h-auto object-contain"
            />
            
            <div className="absolute -z-10 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;