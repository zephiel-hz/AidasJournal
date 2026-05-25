// ============================================================
// Daftar lagu — tambah lagu baru di sini
// 1. Upload file MP3 ke folder: artifacts/aida/public/music/
// 2. Tambah objek baru di array SONGS di bawah
// ============================================================

export interface Song {
  title: string;
  artist: string;
  file: string; // nama file di folder public/music/ (contoh: "satu.mp3")
}

export const SONGS: Song[] = [
  // Contoh — ganti dengan lagu asli kamu:
  // { title: "Satu",          artist: "Sufian Suhaimi", file: "satu.mp3"          },
  // { title: "Rehat",         artist: "Kunto Aji",      file: "rehat.mp3"         },
  // { title: "Masa Muda",     artist: "Ran",            file: "masa-muda.mp3"     },
  // { title: "Yang Terdalam", artist: "Project Pop",    file: "yang-terdalam.mp3" },
];
