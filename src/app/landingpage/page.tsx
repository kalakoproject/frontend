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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#212529] leading-tight">
              Kalako Software {' '}
              <span className="relative inline-block">
                Teman Pintar 
                {/* SVG Lingkaran Merah */}
                <svg 
                  className="absolute -bottom-1 -left-1 -right-1 w-[105%] h-[110%] pointer-events-none" 
                  viewBox="0 0 200 100" 
                  fill="none" 
                  stroke="currentColor" 
                >
                  <path 
                    className="text-red-500 opacity-80"
                    d="M10,50 C10,10 190,10 190,50 C190,90 10,90 15,55" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
              </span>
              <br />
              Usaha Kamu
            </h1>

            <p className="text-gray-600 text-lg md:text-xl max-w-lg leading-relaxed">“Hai! Yuk mulai perjalanan usahamu lebih teratur. Kalako siap bantu.”
            </p>
          </div>

          {/* SISI KANAN: ILLUSTRATION */}
          <div className="w-full lg:w-1/2 relative flex justify-center items-center mt-8 lg:mt-0">
            <img 
              src="https://img.freepik.com/free-vector/isometric-logistics-concept-with-truck-warehouse-drone_1284-63345.jpg" 
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