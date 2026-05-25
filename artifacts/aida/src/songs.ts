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
  { title: "Tak Di Tanganku",          artist: "Juicy Luicy ft Mawar de Jongh", file: "Tak di tanganku.mp3"          },
  { title: "Bentuk Cinta",         artist: "Eclat",      file: "bentuk cinta.mp3"         },
  { title: "Bersamamu",     artist: "Jaz",            file: "bersamamu.mp3"     },
  { title: "Bergema Sampai Selamanya", artist: "Nadhif Basalamah",    file: "bergema sampai selamanya.mp3" },
  { title: "Anugerah Terindah", artist: "Andmesh",    file: "anugerah terindah.mp3" },
  { title: "Semenjak Ada Dirimu", artist: "Yovie Widianto, HIVI!",    file: "Semenjak Ada Dirimu.mp3" },
  { title: "Nanti Kita Seperti Ini", artist: "BATAS SENJA",    file: "Nanti Kita Seperti Ini.mp3" },
];
