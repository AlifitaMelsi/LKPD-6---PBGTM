
// ================= ELEMENT FORM =================
const form = document.getElementById("registrationForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const ekskulInput = document.getElementById("ekskul");

const passwordError = document.getElementById("passwordError");
const passwordHint = document.getElementById("passwordHint");
const statusCard = document.getElementById("statusCard");
const statusText = document.getElementById("statusText");
const submitBtn = form.querySelector('button[type="submit"]');

const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const toastClose = document.getElementById("toastClose");

const confirmOverlay = document.getElementById("confirmOverlay");
const cancelRegistrationBtn = document.getElementById("cancelRegistration");
const confirmCancelBtn = document.getElementById("confirmCancel");
const keepBtn = document.getElementById("keepBtn");

const STORAGE_KEY = "pendaftaranEkskul";
let toastTimer;

// ================= NOTIFIKASI =================
function showToast(title, message, type = "success") {
  clearTimeout(toastTimer);

  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toastIcon.textContent = type === "success" ? "✓" : "!";
  toast.classList.toggle("error-toast", type !== "success");
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

toastClose.addEventListener("click", () => {
  toast.classList.remove("show");
});

// ================= LOCAL STORAGE =================
function getRegistration() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

function saveRegistration(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ================= STATUS PENDAFTARAN =================
function renderStatus() {
  const registration = getRegistration();

  if (registration) {
    statusCard.classList.remove("hidden");
    statusText.textContent =
      `${registration.name} terdaftar di ${registration.ekskul}.`;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sudah Terdaftar";
  } else {
    statusCard.classList.add("hidden");
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Daftar Sekarang <span>↗</span>';
  }
}

// ================= VALIDASI NAMA =================
nameInput.addEventListener("input", () => {
  nameInput.setCustomValidity("");

  if (nameInput.value.trim().length > 0 &&
      nameInput.value.trim().length < 3) {
    nameInput.setCustomValidity("Nama minimal 3 karakter.");
  }
});

// ================= VALIDASI PASSWORD =================
passwordInput.addEventListener("input", () => {
  const length = passwordInput.value.length;

  if (length === 0) {
    passwordHint.textContent = "Minimal 3 karakter.";
    passwordHint.classList.remove("valid");
  } else if (length < 3) {
    passwordHint.textContent =
      `Kurang ${3 - length} karakter lagi.`;
    passwordHint.classList.remove("valid");
  } else {
    passwordHint.textContent = "Password memenuhi syarat.";
    passwordHint.classList.add("valid");
  }

  if (confirmPasswordInput.value) {
    checkPasswordMatch();
  }
});

function checkPasswordMatch() {
  if (!confirmPasswordInput.value) {
    passwordError.textContent = "";
    return false;
  }

  if (passwordInput.value !== confirmPasswordInput.value) {
    passwordError.textContent = "Password tidak sama.";
    return false;
  }

  passwordError.textContent = "";
  return true;
}

confirmPasswordInput.addEventListener("input", checkPasswordMatch);

// ================= PROSES PENDAFTARAN =================
form.addEventListener("submit", (event) => {
  event.preventDefault();
  passwordError.textContent = "";

  if (getRegistration()) {
    showToast(
      "Pendaftaran masih aktif",
      "Batalkan pendaftaran sebelumnya jika ingin mendaftar lagi.",
      "error"
    );
    return;
  }

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const ekskul = ekskulInput.value;

  if (!name || !email || !password || !confirmPassword || !ekskul) {
    showToast("Data belum lengkap", "Silakan isi semua kolom.", "error");
    return;
  }

  if (name.length < 3) {
    showToast("Nama terlalu pendek", "Nama harus minimal 3 karakter.", "error");
    nameInput.focus();
    return;
  }

  if (password.length < 3) {
    passwordError.textContent = "Password minimal 3 karakter.";
    passwordInput.focus();
    return;
  }

  if (password !== confirmPassword) {
    passwordError.textContent = "Konfirmasi password tidak sama.";
    confirmPasswordInput.focus();
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    showToast("Email tidak valid", "Masukkan alamat email yang benar.", "error");
    emailInput.focus();
    return;
  }

  // Password tidak disimpan ke localStorage.
  const registration = {
    name,
    email,
    ekskul,
    registeredAt: new Date().toISOString()
  };

  saveRegistration(registration);
  renderStatus();
  form.reset();

  passwordHint.textContent = "Minimal 3 karakter.";
  passwordHint.classList.remove("valid");
  passwordError.textContent = "";

  showToast(
    "Pendaftaran Berhasil!",
    `Kamu berhasil mendaftar ${ekskul}.`
  );
});

// ================= BATAL FORM =================
document.getElementById("cancelBtn").addEventListener("click", () => {
  passwordError.textContent = "";
  passwordHint.textContent = "Minimal 3 karakter.";
  passwordHint.classList.remove("valid");

  showToast("Form dikosongkan", "Kamu bisa mengisi form kembali.");
});

document.getElementById("closeBtn").addEventListener("click", () => {
  if (!getRegistration()) {
    form.reset();
    passwordError.textContent = "";
    passwordHint.textContent = "Minimal 3 karakter.";
    passwordHint.classList.remove("valid");
  }

  showToast("Form ditutup", "Kamu bisa mengisi form kapan saja.");
});

// ================= PEMBATALAN PENDAFTARAN =================
cancelRegistrationBtn.addEventListener("click", () => {
  confirmOverlay.classList.remove("hidden");
});

keepBtn.addEventListener("click", () => {
  confirmOverlay.classList.add("hidden");
});

confirmCancelBtn.addEventListener("click", () => {
  const registration = getRegistration();

  if (registration) {
    localStorage.removeItem(STORAGE_KEY);
    renderStatus();
    confirmOverlay.classList.add("hidden");

    showToast(
      "Pendaftaran Dibatalkan",
      `Pendaftaran ${registration.ekskul} sudah dibatalkan.`
    );
  }
});

confirmOverlay.addEventListener("click", (event) => {
  if (event.target === confirmOverlay) {
    confirmOverlay.classList.add("hidden");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    confirmOverlay.classList.add("hidden");
    chatWindow.classList.add("hidden");
  }
});

// Tampilkan status tersimpan saat halaman dibuka
renderStatus();

// ================= CHATBOT =================
const chatToggle = document.getElementById("chatToggle");
const chatWindow = document.getElementById("chatWindow");
const chatClose = document.getElementById("chatClose");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const quickQuestions = document.querySelectorAll(".quick-question");

let previousIntent = "";

const ekskulList = [
  "Jurnalistik", "PMR", "Paskibra", "Pencak Silat",
  "Seni Tari", "Bahasa Jepang", "Bantara", "Futsal",
  "Volly", "Drumband", "Robbana", "Rohis",
  "Faster", "Padus"
];

// Buka dan tutup chatbot
chatToggle.addEventListener("click", () => {
  chatWindow.classList.toggle("hidden");

  if (!chatWindow.classList.contains("hidden")) {
    chatInput.focus();
  }
});

chatClose.addEventListener("click", () => {
  chatWindow.classList.add("hidden");
});

// Tambahkan pesan ke jendela chat
function addMessage(message, sender = "bot") {
  const row = document.createElement("div");

  row.className = sender === "user"
    ? "chat-message user-message"
    : "chat-message bot-message";

  if (sender === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "✦";
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = message;

  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Rapikan teks agar mudah dikenali
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, words) {
  return words.some(word => text.includes(word));
}

// Kenali nama ekstrakurikuler
function findEkskul(text) {
  const normalized = normalizeText(text);

  return ekskulList.find(name => {
    const item = normalizeText(name);
    return normalized.includes(item);
  }) || null;
}

// Informasi ekstrakurikuler
const ekskulInfo = {
  "Jurnalistik": "Jurnalistik berfokus pada menulis berita, wawancara, fotografi jurnalistik, dan publikasi informasi sekolah.",
  "PMR": "PMR berfokus pada kepedulian kemanusiaan, pertolongan pertama, kesehatan, dan kegiatan sosial.",
  "Paskibra": "Paskibra melatih kedisiplinan, kerja sama, baris-berbaris, dan tanggung jawab.",
  "Pencak Silat": "Pencak Silat melatih bela diri, konsentrasi, kebugaran, sportivitas, dan pengendalian diri.",
  "Seni Tari": "Seni Tari menjadi tempat belajar gerakan tari, kekompakan, ekspresi, dan penampilan.",
  "Bahasa Jepang": "Bahasa Jepang membantu anggota mempelajari kosakata, percakapan dasar, tulisan, dan budaya Jepang.",
  "Bantara": "Bantara merupakan kegiatan kepramukaan yang mengembangkan kemandirian, kepemimpinan, keterampilan, dan kerja sama.",
  "Futsal": "Futsal melatih teknik bermain bola, strategi, kebugaran, dan kerja sama tim.",
  "Volly": "Volly melatih teknik dasar bola voli, komunikasi, koordinasi, dan sportivitas.",
  "Drumband": "Drumband mengembangkan kemampuan bermusik, ritme, kekompakan, dan kedisiplinan.",
  "Robbana": "Robbana merupakan kegiatan seni musik Islami yang mengembangkan irama, kekompakan, dan kreativitas.",
  "Rohis": "Rohis menjadi wadah kegiatan keagamaan, pembelajaran Islam, diskusi, dan kegiatan sosial.",
  "Faster": "Faster merupakan salah satu pilihan ekstrakurikuler sekolah. Informasi khusus tentang kegiatan dan jadwalnya dapat ditanyakan kepada pembina.",
  "Padus": "Padus atau paduan suara melatih teknik vokal, pernapasan, harmoni, dan kerja sama dalam bernyanyi."
};

// Susun jawaban chatbot
function getBotReply(rawMessage) {
  const message = normalizeText(rawMessage);
  const registration = getRegistration();
  const mentionedEkskul = findEkskul(message);

  // Sapaan
  if (hasAny(message, ["halo", "hai", "hello", "hi", "pagi", "siang", "sore", "malam"])) {
    previousIntent = "greeting";
    return "Hai! 👋 Aku Ekskul Assistant. Kamu bisa bertanya tentang pendaftaran, syarat, pilihan ekstrakurikuler, password, atau pembatalan. Ada yang ingin kamu ketahui?";
  }

  // Terima kasih
  if (hasAny(message, ["terima kasih", "makasih", "thanks", "thank you"])) {
    previousIntent = "thanks";
    return "Sama-sama! ✨ Semoga kamu menemukan ekstrakurikuler yang cocok dan mendapatkan pengalaman seru di sekolah.";
  }

  // Bantuan umum
  if (hasAny(message, ["bantuan", "help", "bisa apa", "fitur", "menu"])) {
    previousIntent = "help";
    return "Aku bisa membantu menjelaskan cara pendaftaran, syarat nama dan password, pilihan ekstrakurikuler, status pendaftaran, serta cara membatalkan pendaftaran. Kamu juga bisa menyebut nama ekskul untuk mengetahui gambaran kegiatannya.";
  }

  // Status pendaftaran
  if (hasAny(message, ["status", "sudah daftar", "udah daftar", "terdaftar", "pendaftaran saya"])) {
    previousIntent = "status";

    if (registration) {
      return `Pendaftaranmu masih aktif, ${registration.name}. Kamu terdaftar di ${registration.ekskul}. Jika ingin membatalkan, tekan tombol Batalkan pada bagian status pendaftaran.`;
    }

    return "Saat ini belum ada pendaftaran yang tersimpan di browser ini. Kamu bisa mengisi form dan menekan tombol Daftar Sekarang untuk mendaftar.";
  }

  // Pembatalan
  if (hasAny(message, ["batal", "batalkan", "membatalkan", "cancel", "menghapus pendaftaran"])) {
    previousIntent = "cancel";

    if (registration) {
      return `Kamu saat ini terdaftar di ${registration.ekskul}. Untuk membatalkan, tekan tombol Batalkan pada status pendaftaran, lalu pilih Ya, Batalkan pada konfirmasi yang muncul.`;
    }

    return "Belum ada pendaftaran aktif yang bisa dibatalkan. Kalau kamu sudah mendaftar di browser lain atau perangkat lain, data tersebut tidak terlihat di sini.";
  }

  // Cara mendaftar
  if (hasAny(message, ["cara daftar", "bagaimana daftar", "gimana daftar", "langkah daftar", "mendaftar", "cara mengisi", "isi form"])) {
    previousIntent = "register";
    return "Cara mendaftar:\n1. Isi nama lengkap minimal 3 karakter.\n2. Masukkan email yang valid.\n3. Buat password minimal 3 karakter.\n4. Ulangi password pada kolom konfirmasi.\n5. Pilih satu ekstrakurikuler.\n6. Tekan Daftar Sekarang.\nJika berhasil, akan muncul notifikasi dan status pendaftaran aktif.";
  }

  // Password
  if (hasAny(message, ["password", "kata sandi", "konfirmasi sandi", "lupa sandi"])) {
    previousIntent = "password";

    if (hasAny(message, ["lupa", "reset"])) {
      return "Form ini belum menyediakan fitur reset password. Jika belum mengirim pendaftaran, kamu bisa mengisi password baru langsung di form.";
    }

    return "Password harus terdiri dari minimal 3 karakter. Kolom Konfirmasi Password harus diisi dengan password yang sama. Untuk keamanan, password tidak disimpan ke localStorage oleh website ini.";
  }

  // Email
  if (hasAny(message, ["email", "surel", "alamat email"])) {
    previousIntent = "email";
    return "Gunakan email dengan format yang benar, misalnya siswa@email.com. Pastikan ada nama pengguna, tanda @, dan domain. Periksa juga apakah ada spasi atau salah ketik.";
  }

  // Nama
  if (hasAny(message, ["nama lengkap", "nama saya", "nama di form"])) {
    previousIntent = "name";
    return "Isi nama lengkap pada kolom Nama Lengkap. Nama harus terdiri dari minimal 3 karakter.";
  }

  // Notifikasi dan hasil
  if (hasAny(message, ["berhasil", "notifikasi", "pesan sukses", "tidak muncul", "gagal daftar", "error"])) {
    previousIntent = "result";

    if (registration) {
      return `Pendaftaran ${registration.ekskul} sudah tersimpan di browser ini. Notifikasi berhasil seharusnya muncul sesaat setelah kamu menekan Daftar Sekarang.`;
    }

    return "Jika semua kolom valid, website akan menampilkan notifikasi Pendaftaran Berhasil dan status aktif. Jika belum berhasil, periksa kolom yang belum lengkap, nama minimal 3 karakter, format email, panjang password, dan kecocokan konfirmasi password.";
  }

  // Informasi ekskul yang disebut secara langsung
  if (mentionedEkskul) {
    previousIntent = "eksul-info";
    return ekskulInfo[mentionedEkskul] ||
      `${mentionedEkskul} merupakan salah satu pilihan ekstrakurikuler. Untuk informasi jadwal, lokasi, dan pembina, silakan tanyakan kepada pihak sekolah.`;
  }

  // Pilihan ekskul
  if (hasAny(message, ["pilihan", "daftar ekskul", "ekskul apa", "ekstrakurikuler apa", "ada ekskul", "macam ekskul", "ekstrakurikuler"])) {
    previousIntent = "eksul-list";
    return "Ada 14 pilihan ekstrakurikuler:\n" +
      ekskulList.map((name, index) => `${index + 1}. ${name}`).join("\n") +
      "\n\nKamu bisa menyebut nama salah satunya untuk mengetahui gambaran kegiatannya.";
  }

  // Jadwal
  if (hasAny(message, ["jadwal", "hari apa", "jam berapa", "waktu latihan", "latihan kapan"])) {
    previousIntent = "schedule";
    return "Jadwal latihan dapat berbeda sesuai ekstrakurikuler dan ketentuan sekolah. Chatbot ini belum memiliki data jadwal resmi, jadi sebaiknya tanyakan langsung kepada pembina ekskul yang kamu pilih.";
  }

  // Lokasi
  if (hasAny(message, ["lokasi", "tempat", "di mana", "dimana"])) {
    previousIntent = "location";
    return "Lokasi kegiatan bisa berbeda untuk setiap ekstrakurikuler. Untuk memastikan tempat latihan, silakan tanyakan kepada pembina atau pengurus ekskul.";
  }

  // Pembina
  if (hasAny(message, ["pembina", "pelatih", "guru"])) {
    previousIntent = "coach";
    return "Informasi nama pembina atau pelatih belum tersedia dalam chatbot ini. Kamu bisa mengonfirmasikannya kepada pihak sekolah.";
  }

  // Syarat pendaftaran
  if (hasAny(message, ["syarat", "persyaratan", "ketentuan", "minimal karakter", "minimal berapa"])) {
    previousIntent = "requirements";
    return "Syarat pada form ini adalah nama minimal 3 karakter, email yang valid, password minimal 3 karakter, konfirmasi password yang sama, dan memilih satu ekstrakurikuler. Pastikan seluruh kolom terisi.";
  }

  // Pertanyaan lanjutan
  if (hasAny(message, ["kenapa", "mengapa", "kok", "tidak bisa", "gabisa", "nggak bisa", "gak bisa"])) {
    if (previousIntent === "password") {
      return "Pastikan password minimal 3 karakter dan kolom konfirmasi berisi teks yang sama persis.";
    }

    if (previousIntent === "name") {
      return "Pastikan nama yang kamu masukkan terdiri dari minimal 3 karakter.";
    }

    if (previousIntent === "register") {
      return "Coba periksa lagi setiap kolom. Nama minimal 3 karakter, email harus valid, password minimal 3 karakter, konfirmasi harus sama, dan pilihan ekstrakurikuler harus sudah ditentukan.";
    }

    if (previousIntent === "cancel") {
      return "Pastikan kamu sudah memiliki status pendaftaran aktif. Tombol Batalkan ada pada kartu status pendaftaran setelah form berhasil dikirim.";
    }

    return "Bisa ceritakan bagian mana yang tidak bisa dilakukan? Misalnya mengisi form, mengirim pendaftaran, atau membatalkan pendaftaran.";
  }

  if (hasAny(message, ["terus", "lalu", "selanjutnya", "setelah itu"])) {
    if (previousIntent === "register") {
      return "Setelah semua kolom terisi dengan benar, tekan tombol Daftar Sekarang. Tunggu notifikasi berhasil dan periksa status pendaftaran di bawah form.";
    }

    if (previousIntent === "cancel") {
      return "Setelah menekan Batalkan, akan muncul jendela konfirmasi. Pilih Ya, Batalkan jika kamu yakin ingin menghapus pendaftaran.";
    }
  }

  // Respons jika pertanyaan tidak dikenali
  previousIntent = "unknown";
  return "Aku belum menemukan jawaban yang tepat untuk pertanyaan itu. Kamu bisa bertanya dengan cara lain atau menyebut topiknya, seperti cara daftar, password, email, jadwal, pembatalan, atau nama ekstrakurikuler. Untuk informasi resmi yang belum ada di chatbot, silakan hubungi pembina atau pihak sekolah.";
}

// Kirim pesan dan tampilkan balasan
function sendChatMessage(message) {
  const cleanMessage = message.trim();
  if (!cleanMessage) return;

  addMessage(cleanMessage, "user");
  chatInput.value = "";

  setTimeout(() => {
    const reply = getBotReply(cleanMessage);
    addMessage(reply, "bot");
  }, 350);
}

// Kirim pesan melalui tombol
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(chatInput.value);
});

// Pertanyaan cepat
quickQuestions.forEach((button) => {
  button.addEventListener("click", () => {
    sendChatMessage(button.dataset.question);
  });
});
