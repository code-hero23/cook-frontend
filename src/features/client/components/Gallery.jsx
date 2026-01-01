import React, { useState, useEffect } from "react";
import axios from "../../../shared/utils/axios";
import { Image as ImageIcon } from "lucide-react";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (!projectId) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      <h2 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
        <ImageIcon className="text-indigo-500" /> Site Gallery
      </h2>

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading gallery...</div>
      ) : images.length === 0 ? (
        <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No site images uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 cursor-pointer">
              <img
                src={`${apiUrl}${img.url}`}
                alt={img.caption || "Site Image"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
