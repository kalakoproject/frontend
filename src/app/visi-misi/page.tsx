import React from 'react';

const VisiMisi: React.FC = () => {
  return (
    <section id="vision" className="w-full bg-white py-14 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* JUDUL UTAMA */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black tracking-wider uppercase">
            VISI MISI
          </h2>
          <div className="w-24 h-1 bg-[#9a3f73] mx-auto mt-4 rounded-full opacity-30"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* CARD VISION */}
          <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-start group">
            <div className="w-12 h-12 bg-[#f09bda] rounded-xl mb-6 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-black mb-6">Visi</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Menjadi ERP lokal andalan yang membantu UMKM tumbuh lebih rapi, modern, dan terukur lewat sistem bisnis digital.
            </p>
          </div>

          {/* CARD MISSION */}
          <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-start group">
            <div className="w-12 h-12 bg-[#f09bda] rounded-xl mb-6 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-black mb-6">Misi</h3>
              <ul className="list-disc pl-6 text-gray-600 text-lg leading-relaxed space-y-2">
                <li>Menyediakan ERP yang simpel, terjangkau, dan siap dipakai UMKM.</li>
                <li>Menyajikan data bisnis melalui dashboard dan laporan yang akurat, ringkas, dan mudah dipahami.</li>
                <li>Memberikan dukungan pelanggan yang responsif dan solutif.</li>
              </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VisiMisi;