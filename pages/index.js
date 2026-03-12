export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* === HERO SECTION - PUSHPA 2 === */}
      <section className="grid lg:grid-cols-2 items-center px-6 lg:px-24 py-20 max-w-7xl mx-auto">
        {/* Left: Title + All 9 Platforms */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-white via-[#00D4FF] to-purple-400 bg-clip-text text-transparent mb-6">
              MOVIE OF THE DAY
            </h1>
            <h2 className="text-4xl lg:text-6xl font-light text-white mb-4">Pushpa 2: The Rule</h2>
            <div className="flex flex-wrap gap-4 text-xl opacity-90 mb-12">
              <span className="px-4 py-1 bg-[#10B981]/20 text-[#10B981] rounded-full">2024 | Telugu</span>
              <span className="px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full">IMDb 8.2</span>
            </div>
          </div>

          {/* 9 OTT Platform Buttons */}
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 max-w-2xl">
            <a href="https://www.netflix.com" target="_blank" className="group netflix-btn p-4 rounded-2xl font-semibold text-sm shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-2 transition-all duration-500">
              🔴 Netflix (Hindi)
            </a>
            <a href="https://www.primevideo.com" target="_blank" className="group prime-btn p-4 rounded-2xl font-semibold text-sm shadow-2xl hover:shadow-yellow-500/25 transform hover:-translate-y-2 transition-all duration-500">
              🟡 Prime (Telugu)
            </a>
            <a href="https://www.hotstar.com" target="_blank" className="group hotstar-btn p-4 rounded-2xl font-semibold text-sm shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-500">
              🟠 Hotstar (Hindi)
            </a>
            <a href="https://www.zee5.com" target="_blank" className="group zee5-btn p-4 rounded-2xl font-semibold text-sm shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 transition-all duration-500">
              🟢 ZEE5 (Telugu)
            </a>
            <a href="https://www.sonyliv.com" target="_blank" className="group sonyliv-btn p-4 rounded-2xl font-semibold text-sm shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 transition-all duration-500">
              🔵 SonyLIV (Tamil)
            </a>
            <a href="https://www.jiocinema.com" target="_blank" className="group jiocinema-btn p-4 rounded-2xl font-semibold text-sm shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-2 transition-all duration-500">
              🟣 JioCinema
            </a>
          </div>
        </div>

        {/* Right: Massive Poster */}
        <div className="relative mt-12 lg:mt-0">
          <div className="w-full h-[500px] lg:h-[700px] bg-gradient-to-br from-gray-800/50 to-transparent rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-all duration-1000 mx-auto max-w-md lg:max-w-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-2xl backdrop-blur-sm border-2 border-white/20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white/80">Pushpa 2 Poster</h3>
              <p className="text-[#00D4FF]/80">Allu Arjun | Rashmika</p>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-white/10 pt-20 pb-12 px-6 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-[#00D4FF] bg-clip-text text-transparent mb-4">
            ReelOracle.in
          </h3>
          <p className="text-white/60 mb-6 max-w-xl mx-auto">
            India's most premium OTT aggregator. Every movie. Every platform. Every language.
          </p>
        </div>
      </footer>
    </div>
  )
}
