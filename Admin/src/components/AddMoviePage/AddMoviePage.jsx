// CineGo / Admin / src / components / AddMoviePage / AddMoviePage.jsx
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import {
  Clock,
  ImageIcon,
  Play,
  Plus,
  Star,
  Theater,
  Upload,
  Users,
  X,
} from "lucide-react";
import "./AddMoviePage.css";

const AddMoviePage = () => {
  const [movieName, setMovieName] = useState("");
  const [categories, setCategories] = useState([]);
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [rating, setRating] = useState(7.5);
  const [duration, setDuration] = useState(120);
  const [slots, setSlots] = useState([
    { id: Date.now(), date: "", time: "", ampm: "AM" },
  ]);
  const [castImages, setCastImages] = useState([]);
  const [directorImages, setDirectorImages] = useState([]);
  const [producerImages, setProducerImages] = useState([]);
  const [story, setStory] = useState("");
  const [movieType, setMovieType] = useState("normal");
  const [standardSeatPrice, setStandardSeatPrice] = useState(0);
  const [reclinerSeatPrice, setReclinerSeatPrice] = useState(0);
  const [ltDurationHours, setLtDurationHours] = useState();
  const [ltDurationMinutes, setLtDurationMinutes] = useState();
  const [ltYear, setLtYear] = useState(new Date().getFullYear());
  const [ltDescription, setLtDescription] = useState("");
  const [ltThumbnail, setLtThumbnail] = useState(null);
  const [ltThumbnailPreview, setLtThumbnailPreview] = useState(null);
  const [ltVideoUrl, setLtVideoUrl] = useState("");
  const [ltDirectorImages, setLtDirectorImages] = useState([]);
  const [ltProducerImages, setLtProducerImages] = useState([]);
  const [ltSingerImages, setLtSingerImages] = useState([]);

  const fileInputRef = useRef();

  const [durationHours, setDurationHours] = useState(Math.floor(duration / 60));
  const [durationMinutes, setDurationMinutes] = useState(
    Math.floor(duration % 60),
  );
  const availableAuditorium = ["Audi 1", "Audi 2", "Audi 3"];
  const [auditorium, setAuditorium] = useState("Audi 1");
  const [customAuditorium, setCustomAuditorium] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const total =
      (Number(durationHours) || 0) * 60 + (Number(durationMinutes) || 0);
    setDuration(total);
  }, [durationHours, durationMinutes]);

  const availableCategories = ["Action", "Horror", "Comedy", "Adventure"];

  function toggleCategory(cat) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  const handlePosterChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPoster(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPosterPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleLtThumbnailChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setLtThumbnail(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLtThumbnailPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const readFilesToPreviewWithMeta = (files, setter, metaType = null) => {
    const arr = Array.from(files);
    const readers = arr.map((file) => {
      return new Promise((res) => {
        const r = new FileReader();
        r.onload = (e) =>
          res({
            file,
            preview: e.target.result,
            ...(metaType === "name" ? { name: "" } : {}),
            ...(metaType === "nameRole" ? { name: "" } : {}),
          });
        r.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((items) => {
      setter((prev) => [...prev, ...items]);
    });
  };

  const handleMultipleFiles = (e, setter, metaType = null) => {
    if (!e.target.files) return;
    readFilesToPreviewWithMeta(e.target.files, setter, metaType);
    e.target.value = null;
  };

  const readFilesToNamedPreviews = (files, setter) => {
    const arr = Array.from(files);
    const readers = arr.map((file) => {
      return new Promise((res) => {
        const r = new FileReader();
        r.onload = (e) => res({ file, preview: e.target.result, name: "" });
        r.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((items) => {
      setter((prev) => [...prev, ...items]);
    });
  };

  const handleMultipleNameFiles = (e, setter) => {
    if (!e.target.files) return;
    readFilesToNamedPreviews(e.target.files, setter);
    e.target.value = null;
  };

  const removePreview = (id, setter) => {
    setter((prev) => prev.filter((p, idx) => idx !== id));
  };

  const updateNamedItemName = (idx, setter, value) => {
    setter((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, name: value } : it)),
    );
  };

  const updateMetaField = (idx, setter, field, value) => {
    setter((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  };

  function addSlot() {
    setSlots((s) => [
      ...s,
      { id: Date.now() + Math.random(), date: "", time: "", ampm: "AM" },
    ]);
  }

  function removeSlot(id) {
    setSlots((s) => s.filter((slot) => slot.id !== id));
  }

  function updateSlot(id, field, value) {
    setSlots((s) =>
      s.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)),
    );
  }

  function resetForm() {
    setMovieName("");
    setCategories([]);
    setPoster(null);
    setPosterPreview(null);
    setTrailerUrl("");
    setVideoUrl("");
    setRating(7.5);
    setDuration(120);
    setDurationHours(Math.floor(120 / 60));
    setDurationMinutes(120 % 60);
    setSlots([{ id: Date.now(), date: "", time: "", ampm: "AM" }]);
    setCastImages([]);
    setDirectorImages([]);
    setProducerImages([]);
    setStory("");
    setMovieType("normal");
    setStandardSeatPrice(0);
    setReclinerSeatPrice(0);
    setLtDurationHours(1);
    setLtDurationMinutes(30);
    setLtYear(new Date().getFullYear());
    setLtDescription("");
    setLtThumbnail(null);
    setLtThumbnailPreview(null);
    setLtVideoUrl("");
    setLtDirectorImages([]);
    setLtProducerImages([]);
    setLtSingerImages([]);
    setAuditorium("Audi 1");
    setCustomAuditorium("");
  }

  function validate() {
    if (movieType === "latestTrailers") {
      if (!movieName.trim()) return "Please enter title for latest trailer.";

      if (!categories.length)
        return "Please choose at least one genree for latest trailer.";

      if (!ltThumbnail)
        return "Please select a thumbnail image for latest trailer.";

      if (!ltVideoUrl.trim())
        return "Please provide the video URL for latest trailer.";

      if (!ltDescription.trim())
        return "Please add description for latest trailer.";

      if (!ltYear) return "Please enter year for latest trailer.";

      const badDirector = ltDirectorImages.find(
        (d) => d && (!d.name || !d.name.trim()),
      );
      if (badDirector) return "Please add a name for every director image.";

      const badProducer = ltProducerImages.find(
        (d) => d && (!d.name || !d.name.trim()),
      );
      if (badProducer) return "Please add a name for every producer image.";

      const badSinger = ltSingerImages.find(
        (d) => d && (!d.name || !d.name.trim()),
      );
      if (badSinger) return "Please add a name for every singer image.";

      return null;
    }

    if (!movieName.trim()) return "Please enter movie name.";

    if (movieType !== "releaseSoon" && !poster)
      return "Please add a poster image.";

    if (movieType !== "releaseSoon") {
      if (!categories.length) return "Please choose at least one category";
    }

    if (movieType === "normal" || movieType === "featured") {
      if (
        Number.isNaN(Number(standardSeatPrice)) ||
        Number(standardSeatPrice) <= 0
      )
        // return "Please enter a valid recliner seat price.";
        return "Please enter a valid standard seat price.";

      const finalAuditorium =
        auditorium === "Other" ? (customAuditorium || "").trim() : auditorium;
      if (!finalAuditorium) return "Please select auditorium";
    }

    if (movieType === "normal" || movieType === "featured") {
      const badCast = castImages.find((c) => {
        if (!c) return false;
        return !c.name || !c.name.trim() || !c.role || !c.role.trim();
      });
      if (badCast) return "Please add a name for every cast image.";

      const badDirector = directorImages.find(
        (d) => d && (!d.name || !d.name.trim()),
      );
      if (badDirector) return "Please add a name for every director image.";

      const badProducer = producerImages.find(
        (p) => p && (!p.name || !p.name.trim()),
      );
      if (badProducer) return "Please add a name for every producer image.";
    }

    return null;
  }

  function appendFilesToForm(from, fieldName, items) {
    if (!items || items.length === 0) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      // if (it && it.file) form.append(fieldName, it.file);
      if (it && it.file) from.append(fieldName, it.file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);

    setIsUploading(true);
    const form = new FormData();

    form.append("type", movieType);

    if (movieType === "latestTrailers") {
      const latestTrailerObj = {
        title: movieName,
        generes: categories,
        duration: {
          hours: Number(ltDurationHours) || 0,
          minutes: Number(ltDurationMinutes) || 0,
        },
        year: Number(ltYear) || new Date().getFullYear(),
        rating: Number(rating) || 0,
        description: ltDescription,
        thumbnail: ltThumbnail,
        videoId: ltVideoUrl,
        directors: ltDirectorImages.map((d) => ({
          name: d.name || "",
          file: d.file ? d.file.name : null,
        })),
        producers: ltProducerImages.map((p) => ({
          name: p.name || "",
          file: p.file ? p.file.name : null,
        })),
        singers: ltSingerImages.map((s) => ({
          name: s.name || "",
          file: s.file ? s.file.name : null,
        })),
      };

      form.append("movieName", movieName);
      form.append("latestTrailer", JSON.stringify(latestTrailerObj));

      if (ltThumbnail) form.append("ltThumbnail", ltThumbnail);

      appendFilesToForm(form, "ltDirectorImages", ltDirectorImages);
      appendFilesToForm(form, "ltProducerImages", ltProducerImages);
      appendFilesToForm(form, "ltSingerImages", ltSingerImages);
    } else {
      form.append("movieName", movieName);
      form.append("categories", JSON.stringify(categories));
      if (poster) form.append("poster", poster);
      form.append("trailerUrl", trailerUrl || "");
      form.append("videoUrl", videoUrl || "");
      form.append("rating", String(rating));
      form.append("duration", String(duration));
      form.append("slots", JSON.stringify(slots));
      form.append(
        "seatPrices",
        JSON.stringify({
          standard: Number(standardSeatPrice),
          recliner: Number(reclinerSeatPrice),
        }),
      );

      // const finalAuditorium = auditorium = "Other"
      //   ? customAuditorium.trim() || "Audi"
      //   : auditorium;

      const finalAuditorium =
        auditorium === "Other" ? customAuditorium.trim() || "Audi" : auditorium;

      form.append("auditorium", finalAuditorium);

      form.append(
        "cast",
        JSON.stringify(
          castImages.map((c) => ({
            name: c.name || "",
            role: c.role || "",
            file: c.file ? c.file.name : null,
          })),
        ),
      );

      form.append(
        "directors",
        JSON.stringify(
          directorImages.map((d) => ({
            name: d.name || "",
            role: d.role || "",
            file: d.file ? d.file.name : null,
          })),
        ),
      );

      form.append(
        "producers",
        JSON.stringify(
          producerImages.map((p) => ({
            name: p.name || "",
            role: p.role || "",
            file: p.file ? p.file.name : null,
          })),
        ),
      );

      form.append("story", story || "");

      appendFilesToForm(form, "castFiles", castImages);
      appendFilesToForm(form, "directorFiles", directorImages);
      appendFilesToForm(form, "producerFiles", producerImages);
    }

    try {
      const response = await api.post(API_ROUTES.MOVIE.MOVIE_CREATE, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Create Movie API Response:", response);

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        console.log("Create Movie Success:", response?.data?.message);

        resetForm();
      } else {
        toast.warn(response?.data?.message);
        console.log("Create Movie Data Error:", response?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      console.log("Create Movie Error:", error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-linear-to-b from-black via-gray-900 to-gray-800 text-gray-100 ">
      <div className="max-w-6xl mx-auto bg-linear-to-r from-black via-purple-900 to-black/80 border-2 border-purple-700 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-cinzel">
            <Theater className="inline-block mr-2 -translate-y-1" /> Add Movie
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* -------- Movie Type Radious -------- */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 lg:gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="movieType"
                checked={movieType === "normal"}
                onChange={() => setMovieType("normal")}
                className="accent-purple-800"
              />{" "}
              <span>Normal</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="movieType"
                checked={movieType === "featured"}
                onChange={() => setMovieType("featured")}
                className="accent-purple-800"
              />{" "}
              <span>Featured</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="movieType"
                checked={movieType === "releaseSoon"}
                onChange={() => setMovieType("releaseSoon")}
                className="accent-purple-800"
              />{" "}
              <span>Coming Soon</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="movieType"
                checked={movieType === "latestTrailers"}
                onChange={() => setMovieType("latestTrailers")}
                className="accent-purple-800"
              />{" "}
              <span>Latest Trailers</span>
            </label>
          </div>

          {/* -------- Latest Trailers -------- */}
          {movieType === "latestTrailers" && (
            <section className="bg-black/20 p-4 rounded-lg border border-purple-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="">
                  <label className="block text-sm mb-2">Title</label>
                  <input
                    value={movieName}
                    onChange={(e) => setMovieName(e.target.value)}
                    className="w-full rounded-lg p-3 bg-black/20 border border-purple-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-800"
                    placeholder="Trailer title"
                  />
                </div>

                <div className="">
                  <label className="block text-sm mb-2">
                    Genre (choose one or more)
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1 rounded-full border border-purple-700 text-white ${
                          categories.includes(cat)
                            ? "bg-purple-700"
                            : "bg-black/20"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <div>
                    <label className="block text-sm mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={ltDurationHours}
                      min={0}
                      onChange={(e) =>
                        setLtDurationHours(Number(e.target.value) || 0)
                      }
                      className="w-32 rounded-lg p-2 bg-black/20 border border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-800"
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={ltDurationMinutes}
                      min={0}
                      max={59}
                      onChange={(e) =>
                        setLtDurationMinutes(Number(e.target.value) || 0)
                      }
                      className="w-32 rounded-lg p-2 bg-black/20 border border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-800"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Year</label>
                    <input
                      type="number"
                      value={ltYear}
                      onChange={(e) =>
                        setLtYear(
                          Number(e.target.value) || new Date().getFullYear(),
                        )
                      }
                      className="w-32 rounded-lg p-2 bg-black/20 border border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-800"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm mb-2">Description</label>
                  <textarea
                    value={ltDescription}
                    onChange={(e) => setLtDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg p-3 bg-black/20 border border-purple-600 resize-none focus:outline-none focus:ring-1 focus:ring-purple-800"
                    placeholder="Short description..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Thumbnail Image</label>
                  <div className="border border-dashed border-purple-700 rounded-lg p-3 bg-black/30">
                    {ltThumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={ltThumbnailPreview}
                          alt="Thumbnail"
                          className="w-full h-40 sm:h-48 object-contain rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLtThumbnail(null);
                            setLtThumbnailPreview(null);
                          }}
                          className="absolute -top-2 right-2 bg-purple-700/90 p-1 rounded-full"
                        >
                          <X className="size-6" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                        <div className="p-4 rounded-md bg-black/40 border border-purple-700">
                          <ImageIcon className="size-36" />
                        </div>

                        <div className="text-xs opacity-80">
                          Click to upload thumbnail
                        </div>
                        <input
                          type="file"
                          // accept="image/"
                          accept="image/*"
                          onChange={handleLtThumbnailChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Video URL</label>
                  <input
                    value={ltVideoUrl}
                    onChange={(e) => setLtVideoUrl(e.target.value)}
                    className="w-full rounded-lg p-3 bg-black/20 border border-purple-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-800"
                    placeholder="https://(YouTube/Vimeo URL)"
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">
                  <NameUploader
                    title="Director Images"
                    onFiles={(e) =>
                      handleMultipleNameFiles(e, setLtDirectorImages)
                    }
                    items={ltDirectorImages}
                    remove={(i) => removePreview(i, setLtDirectorImages)}
                    updateName={(i, v) =>
                      updateNamedItemName(i, setLtDirectorImages, v)
                    }
                    icon={<ImageIcon />}
                  />

                  <NameUploader
                    title="Producer Images"
                    onFiles={(e) =>
                      handleMultipleNameFiles(e, setLtProducerImages)
                    }
                    items={ltProducerImages}
                    remove={(i) => removePreview(i, setLtProducerImages)}
                    updateName={(i, v) =>
                      updateNamedItemName(i, setLtProducerImages, v)
                    }
                    icon={<Upload />}
                  />

                  <NameUploader
                    title="Singer Images"
                    onFiles={(e) =>
                      handleMultipleNameFiles(e, setLtSingerImages)
                    }
                    items={ltSingerImages}
                    remove={(i) => removePreview(i, setLtSingerImages)}
                    updateName={(i, v) =>
                      updateNamedItemName(i, setLtSingerImages, v)
                    }
                    icon={<Users />}
                  />
                </div>
              </div>
            </section>
          )}

          {/* -------- Original Movie Form -------- */}
          {movieType !== "latestTrailers" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm mb-2">Poster Image</label>

                  <div className="border border-dashed border-purple-700 rounded-lg p-3 bg-black/30">
                    {posterPreview ? (
                      <div className="relative">
                        <img
                          src={posterPreview}
                          alt="Poster"
                          className="w-full h-48 object-contain rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPoster(null);
                            setPosterPreview(null);
                          }}
                          className="absolute -top-2 right-2 bg-purple-700/90 p-1 rounded-full"
                          title="Remove"
                        >
                          <X className="size-6" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                        <div className="p-4 rounded-md bg-black/40 border border-purple-700">
                          <ImageIcon className="size-36" />
                        </div>
                        <div className="text-xs opacity-80">
                          Click to upload poster
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="">
                    <label className="block text-sm mb-2">Movie Name</label>
                    <input
                      value={movieName}
                      onChange={(e) => setMovieName(e.target.value)}
                      className="w-full rounded-lg p-3 bg-black/20 border border-purple-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-800"
                      placeholder="Enter Movie Title"
                    />
                  </div>

                  <div className="">
                    <label className="block text-sm mb-2">Categories</label>
                    <div className="flex gap-3 flex-wrap">
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1 rounded-full border text-white border-purple-700 ${
                            categories.includes(cat)
                              ? "bg-purple-700 "
                              : "bg-black/20"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(movieType === "normal" || movieType === "featured") && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-2">
                          Standard Seat Price (required)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={standardSeatPrice}
                          onChange={(e) => setStandardSeatPrice(e.target.value)}
                          placeholder="Example: LKR 150.00"
                          className="w-full rounded-lg p-3 bg-black/20 border border-purple-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-800"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-2">
                          Recliner Seat Price (required)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={reclinerSeatPrice}
                          onChange={(e) => setReclinerSeatPrice(e.target.value)}
                          placeholder="Example: LKR 250.00"
                          className="w-full rounded-lg p-3 bg-black/20 border border-purple-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-800"
                        />
                      </div>

                      {/* -------- Auditorium Selector -------- */}
                      <div>
                        <label className="block text-sm mb-2">Auditorium</label>
                        <select
                          value={auditorium}
                          onChange={(e) => setAuditorium(e.target.value)}
                          className="w-full rounded-lg p-2 bg-black/20 border border-purple-600"
                        >
                          {availableAuditorium.map((a) => (
                            <option
                              value={a}
                              key={a}
                              className="bg-black text-white"
                            >
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {movieType !== "releaseSoon" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">
                          Trailer URL
                        </label>
                        <div className="flex items-center gap-2">
                          <Play />
                          <input
                            value={trailerUrl}
                            onChange={(e) => setTrailerUrl(e.target.value)}
                            placeholder="https://"
                            className="w-full rounded-lg p-3 bg-black/20 border border-purple-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm mb-2">Rating</label>
                        <div className="flex items-center gap-3">
                          <Star />
                          <input
                            type="number"
                            value={rating}
                            step="0.1"
                            min="0"
                            max="10"
                            onChange={(e) => setRating(Number(e.target.value))}
                            placeholder="7.5"
                            className="w-full rounded-lg p-2 bg-black/20 border border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-800"
                          />
                        </div>
                      </div>

                      {(movieType === "normal" || movieType === "featured") && (
                        <>
                          <div>
                            <label className="block text-sm mb-2">
                              Duration (hours)
                            </label>
                            <div className="flex items-center gap-3">
                              <Clock />
                              <input
                                type="number"
                                value={durationHours}
                                min={0}
                                onChange={(e) =>
                                  setDurationHours(Number(e.target.value) || 0)
                                }
                                className="w-full rounded-lg p-2 bg-black/20 border border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-800"
                                placeholder="2"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm mb-2">
                              Duration (minutes)
                            </label>
                            <div className="flex items-center gap-3">
                              <Clock />
                              <input
                                type="number"
                                value={durationMinutes}
                                min={0}
                                max={59}
                                onChange={(e) => {
                                  let v = Number(e.target.value);
                                  if (Number.isNaN(v)) v = 0;
                                  if (v < 0) v = 0;
                                  if (v > 59) v = 59;
                                  setDurationMinutes(v);
                                }}
                                className="w-full rounded-lg p-2 bg-black/20 border border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-800"
                                placeholder="30"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {movieType !== "normal" &&
                        movieType !== "featured" &&
                        movieType !== "releaseSoon" && (
                          <div>
                            <label className="block text-sm mb-2">
                              Duration(minutes)
                            </label>
                            <div className="flex items-center gap-3">
                              <Clock />
                              <input
                                type="number"
                                value={duration}
                                min={1}
                                onChange={(e) => {
                                  const v = Number(e.target.value) || 0;
                                  setDuration(v);
                                  setDurationHours(Math.floor(v / 60));
                                  setDurationMinutes(v % 60);
                                }}
                                className="w-32 rounded-lg p-2 bg-black/20 border border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-800"
                                placeholder="30"
                              />
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* -------- Slots -------- */}
              {movieType !== "releaseSoon" && (
                <section className="bg-black/20 p-4 rounded-lg border border-purple-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Movie Slots</h3>

                    <button
                      type="button"
                      onClick={addSlot}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-700 text-sm"
                    >
                      <Plus className="" /> Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {slots.map((slot, idx) => (
                      <div
                        key={slot.id}
                        className="flex gap-3 items-center flex-col sm:flex-row"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                          <input
                            type="date"
                            value={slot.date}
                            onChange={(e) =>
                              updateSlot(slot.id, "date", e.target.value)
                            }
                            className="p-2 rounded-lg bg-black/20 border border-gray-700 w-full focus:outline-none focus:ring-1 focus:ring-purple-800"
                          />

                          <input
                            type="time"
                            value={slot.time}
                            onChange={(e) =>
                              updateSlot(slot.id, "time", e.target.value)
                            }
                            className="p-2 rounded-lg bg-black/20 border border-gray-700 w-full focus:outline-none focus:ring-1 focus:ring-purple-800"
                          />

                          <select
                            value={slot.ampm}
                            onChange={(e) =>
                              updateSlot(slot.id, "ampm", e.target.value)
                            }
                            className="p-2 rounded-lg bg-black/20 border border-gray-700 w-full"
                          >
                            <option className="bg-black text-white">AM</option>
                            <option className="bg-black text-white">PM</option>
                          </select>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => removeSlot(slot.id)}
                            className="p-1 rounded-full bg-purple-700"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* -------- Cast / Directors Producers Uploads -------- */}
              {movieType !== "releaseSoon" && (
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">
                  <Uploader
                    title="Cast Photos"
                    onFiles={(e) =>
                      handleMultipleFiles(e, setCastImages, "nameRole")
                    }
                    items={castImages}
                    remove={(i) => removePreview(i, setCastImages)}
                    updateMeta={(i, field, v) =>
                      updateMetaField(i, setCastImages, field, v)
                    }
                    icon={<Users />}
                  />

                  <Uploader
                    title="Director Photos"
                    onFiles={(e) =>
                      handleMultipleFiles(e, setDirectorImages, "name")
                    }
                    items={directorImages}
                    remove={(i) => removePreview(i, setDirectorImages)}
                    updateMeta={(i, field, v) =>
                      updateMetaField(i, setDirectorImages, field, v)
                    }
                    icon={<ImageIcon />}
                  />

                  <Uploader
                    title="Producer Photos"
                    onFiles={(e) =>
                      handleMultipleFiles(e, setProducerImages, "name")
                    }
                    items={producerImages}
                    remove={(i) => removePreview(i, setProducerImages)}
                    updateMeta={(i, field, v) =>
                      updateMetaField(i, setProducerImages, field, v)
                    }
                    icon={<Upload />}
                  />
                </div>
              )}

              {movieType !== "releaseSoon" && (
                <div className="">
                  <label className="block text-sm mb-2">Story</label>
                  <textarea
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg p-3 bg-black/20 border border-purple-600 resize-none focus:outline-none focus:ring-1 focus:ring-purple-800"
                    placeholder="Write the movie story here..."
                  ></textarea>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 justify-end flex-col sm:flex-row">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-purple-700 w-full sm:w-auto"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 rounded-lg bg-purple-700 font-semibold w-full sm:w-auto"
            >
              {isUploading ? "Uploading..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Uploader({ title, onFiles, items, remove, icon, updateMeta }) {
  return (
    <div className="border border-dashed border-purple-700 rounded-lg p-3 bg-black/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}

          <h4 className="font-semibold">{title}</h4>
        </div>

        <label className="text-xs px-3 py-1 bg-purple-700 rounded-full cursor-pointer">
          + Add
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFiles}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {items && items.length ? (
          items.map((it, idx) => (
            <div key={idx} className="relative bg-black/30 p-2 rounded-md">
              <img
                src={it.preview}
                alt="Preview"
                className="w-full h-36 sm:h-40 md:h-28 object-contain rounded-md"
              />

              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute -top-1 -right-2 bg-purple-700 p-1 rounded-full"
              >
                <X className="absolute -top-1 -right-2 bg-purple-700 p-1 rounded-full" />
              </button>

              {typeof it.name !== "undefined" && (
                <div className="mt-2">
                  <input
                    value={it.name}
                    onChange={(e) =>
                      updateMeta && updateMeta(idx, "name", e.target.value)
                    }
                    placeholder="Name"
                    className="w-full rounded-md p-1 text-sm bg-black/10 border border-gray-700"
                  />
                </div>
              )}

              {typeof it.name !== "undefined" && (
                <div className="mt-2">
                  <input
                    // value={it.role}
                    value={it.role || ""}
                    onChange={(e) =>
                      updateMeta && updateMeta(idx, "role", e.target.value)
                    }
                    placeholder="Role"
                    className="w-full rounded-md p-1 text-sm bg-black/10 border border-gray-700"
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 text-sm opacity-80">
            No Images Added
          </div>
        )}
      </div>
    </div>
  );
}

function NameUploader({ title, onFiles, items, remove, updateName, icon }) {
  return (
    <div className="border border-dashed border-purple-700 rounded-lg p-3 bg-black/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}

          <h4 className="font-semibold">{title}</h4>
        </div>

        <label className="text-xs px-3 py-1 bg-purple-700 rounded-full cursor-pointer">
          + Add
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFiles}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items && items.length ? (
          items.map((it, idx) => (
            <div
              key={idx}
              className="relative flex gap-2 items-center bg-black/30 p-2 rounded-md"
            >
              <img
                src={it.preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-md"
              />

              <div className="flex-1">
                <input
                  value={it.name}
                  onChange={(e) => updateName(idx, e.target.value)}
                  placeholder="Name"
                  className="w-full rounded-lg p-2 bg-black/20 border border-gray-700 mb-2"
                />

                {/* <div className="text-xs opacity-80">File: {it?.file?.name}</div> */}

                <div className="text-xs opacity-80 break-all max-w-full">
                  File: {it?.file?.name}
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-0 -right-1 bg-purple-700 p-1 rounded-full"
              >
                <X className="size-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 text-sm opacity-80">
            No Images Added
          </div>
        )}
      </div>
    </div>
  );
}

export default AddMoviePage;
