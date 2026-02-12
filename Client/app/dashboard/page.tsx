"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FileIcon,
  Trash2,
  Download,
  LogOut,
  Upload,
  Search,
  Grid,
  List,
  HardDrive,
  Loader2,
} from "lucide-react";
import { AxiosError } from "axios";

interface FileData {
  ID: number;
  original_name: string;
  size: number;
  content_type: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Track upload state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const res = await api.get("/files/list");
      setFiles(res.data.files || []);
    } catch (err: unknown) {
      console.error(err);
      if (
        err instanceof AxiosError &&
        (err.response?.status === 401 || err.response?.status === 403)
      ) {
        router.push("/login");
      } else {
        toast.error("Failed to load files", {
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      toast.success("Logged out successfully", {
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #334155",
        },
      });
      router.push("/login");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Logout failed");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large (max 5MB)", {
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #ef4444",
        },
      });
      e.target.value = ""; // Reset input
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    const toastId = toast.loading("Uploading file...", {
      style: {
        background: "#1e293b",
        color: "#fff",
        border: "1px solid #334155",
      },
    });

    try {
      await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("File uploaded successfully", {
        id: toastId,
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #334155",
        },
      });
      fetchFiles(); // Refresh list
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = "Upload failed";
      if (err instanceof AxiosError && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      toast.error(errorMessage, {
        id: toastId,
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #ef4444",
        },
      });
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await api.delete(`/files/delete/${id}`);
      toast.success("File deleted", {
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #334155",
        },
        icon: "🗑️",
      });
      setFiles(files.filter((f) => f.ID !== id));
    } catch (err: unknown) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleDownload = (id: number) => {
    window.open(`http://localhost:3000/files/download/${id}`, "_blank");
  };

  // Helper to format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filter files based on search
  const filteredFiles = files.filter((file) =>
    file.original_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">Loading your drive...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <HardDrive className="text-white" size={22} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Mini Drive
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".jpg,.png,.pdf"
        />

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search your files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-slate-200 placeholder-slate-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all ${viewMode === "list" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>

            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95 border border-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Upload size={20} />
              )}
              <span>{uploading ? "Uploading..." : "Upload File"}</span>
            </button>
          </div>
        </div>

        {/* Files Display */}
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 mb-6 border border-slate-800">
              {searchQuery ? (
                <Search className="text-slate-600" size={32} />
              ) : (
                <Upload className="text-slate-600" size={32} />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No matches found" : "No files uploaded yet"}
            </h3>
            <p className="text-slate-500 max-w-sm text-center">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Upload your first file to get started with Mini Drive"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-3"
            }
          >
            {filteredFiles.map((file) => (
              <div
                key={file.ID}
                className={`group bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 ${
                  viewMode === "list"
                    ? "flex items-center justify-between p-4"
                    : "p-5 flex flex-col gap-4"
                }`}
              >
                <div
                  className={`flex items-center gap-4 ${viewMode === "list" ? "flex-1" : ""}`}
                >
                  <div
                    className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 text-blue-400 shadow-inner ${
                      viewMode === "list" ? "w-10 h-10" : "w-14 h-14"
                    }`}
                  >
                    <FileIcon size={viewMode === "list" ? 20 : 28} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors"
                      title={file.original_name}
                    >
                      {file.original_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 ${viewMode === "grid" ? "justify-end pt-4 border-t border-slate-800/50" : ""}`}
                >
                  <button
                    onClick={() => handleDownload(file.ID)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(file.ID)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
