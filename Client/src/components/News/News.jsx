// CineGo / Client / src / components / News / News.jsx
import { sampleNews } from "../../assets/newdummydata";
import { Calendar, Clock, Image, Sparkles } from "lucide-react";
import "./News.css";

const News = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-100 text-black">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="font-monoton text-3xl sm:text-4xl md:text-5xl text-purple-600 tracking-wider">
              CineNews
            </div>

            <div className="font-roboto text-xs sm:text-sm text-gray-500 font-medium">
              Latest • Curated • Cinematic
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="ml-auto inline-flex cursor-pointer bg-linear-to-r from-purple-400 to-purple-500 items-center gap-2 text-white px-3 sm:px-4 py-2 rounded-full hover:shadow-lg transition">
              <Image size={16} />
              <span className="text-xs sm:text-sm">Latest News</span>
            </button>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex items-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-purple-50 via-white to-purple-50 p-1">
          <div className="text-xs text-purple-600 font-semibold px-3 sm:px-4">
            Featured
          </div>
          <div className="flex-1 text-xs sm:text-sm text-gray-500 line-clamp-1">
            {sampleNews[0].title} -- {sampleNews[0].excerpt}
          </div>

          <div className="px-3 sm:px-4">
            <Sparkles size={16} className="text-purple-500" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* -------- Left Side -------- */}
          <article className="relative rounded-3xl overflow-hidden bg-white shadow-xl transform transition hover:shadow-2xl lg:col-span-2">
            <div className="relative">
              <div className="h-85 sm:h-64 md:h-105 lg:h-96 xl:h-80 w-full relative">
                <img
                  src={sampleNews[0].image}
                  alt={sampleNews[0].title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/75 to-transparent opacity-0 animate-fadeIn"></div>

                <div className="absolute left-5 sm:left-8 bottom-5 sm:bottom-8 right-5 sm:right-8">
                  <span className="inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    {sampleNews[0].category}
                  </span>

                  <h1 className="news-title mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">
                    {sampleNews[0].title}
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm md:text-base text-white max-w-full sm:max-w-3xl">
                    {sampleNews[0].excerpt}
                  </p>

                  <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 text-white">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} />
                      <span className="text-xs sm:text-sm">
                        {sampleNews[0].time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} />
                      <span className="text-xs sm:text-sm">
                        {sampleNews[0].date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {sampleNews.slice(1, 4).map((item) => (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-gray-300 p-0 shadow-md transform transition hover:-translate-y-2 hover:shadow-xl flex flex-col h-full"
                  >
                    <div className="relative h-40 sm:h-36 md:h-32 w-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 "
                        loading="lazy"
                      />

                      <div className="absolute left-3 bottom-3">
                        <span className="absolute left-3 bottom-3 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <div>
                        <h3 className="font-roboto text-base sm:text-lg font-semibold">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-xs sm:text-sm text-gray-500 line-clamp-4">
                          {item.excerpt}
                        </p>
                      </div>

                      <div className="mt-auto pt-2"></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </article>

          {/* -------- Right Side -------- */}
          <aside className="space-y-6">
            {sampleNews.slice(4, 7).map((item) => (
              <div
                key={item.id}
                className="relative rounded-2xl overflow-hidden bg-white shadow-lg transform transition hover:shadow-2xl"
              >
                <div className="flex items-stretch">
                  <div className="w-28 sm:w-32 h-28 sm:h-32 overflow-hidden shrink-0 rounded-l-2xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-3 sm:p-4 flex-1">
                    <div className="flex items-start gap-2">
                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-md font-semibold">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="font-roboto mt-2 font-semibold text-black text-sm sm:text-base">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-4">
                      {item.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl p-4 sm:p-6 bg-linear-to-b from-white to-purple-50 border border-gray-300 shadow-md">
              <h5 className="font-roboto text-base sm:text-lg font-semibold">
                Cine News
              </h5>

              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                Stay updated with the latest movie news, insider stories, and
                sneak peeks of upcoming trailers.
              </p>

              <div className="mt-3 sm:mt-4 flex gap-2">
                <input
                  className="flex-1 px-3 sm:px-4 py-2 rounded-xl border border-gray-300 outline-none text-sm placeholder:text-gray-400"
                  placeholder="Email address..."
                />

                <button className="inline-flex cursor-pointer items-center gap-2 bg-purple-600 text-white px-2 sm:px-4 py-2 rounded-xl shadow hover:bg-purple-700 transition text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default News;
