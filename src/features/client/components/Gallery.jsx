import React, { useState, useEffect } from "react";
import axios from "../../../shared/utils/axios";
import { Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import useHaptics from "../../../shared/hooks/useHaptics";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const { trigger } = useHaptics();

  const project = JSON.parse(localStorage.getItem("clientProject") || "{}");
  const projectId = project.id;
  const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    if (projectId) {
      const fetchImages = async () => {
        try {
          const res = await axios.get(`/project-data/${projectId}/images`);
          setImages(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchImages();
    }
  }, [projectId]);

  const handleDownload = (imgUrl) => {
    trigger('medium');
    // Direct navigation is most reliable for mobile
    // Server sends 'Content-Disposition: attachment', so browser will download it.
    window.open(imgUrl, '_blank');
    trigger('success');
  };

  if (!projectId) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-100">
          <ImageIcon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Site Gallery</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Visual Progress Documentation</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading gallery...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">No Images Yet</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Site photos will appear here once uploaded by the team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => {
            const fullUrl = `${apiUrl}${img.url}`;
            const isDownloading = downloadingId === img.id;

            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-sm"
              >
                <img
                  src={fullUrl}
                  alt={img.caption || "Site Image"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay - Always visible on mobile, hover on desktop */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  {img.caption && (
                    <p className="text-white text-xs font-bold line-clamp-2 mb-2">{img.caption}</p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(fullUrl, img.caption || `image-${img.id}.jpg`);
                    }}
                    disabled={isDownloading}
                    className="relative z-20 w-full py-2.5 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                  >
                    {isDownloading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Download size={12} />
                    )}
                    {isDownloading ? "Saving..." : "Download"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Gallery;
