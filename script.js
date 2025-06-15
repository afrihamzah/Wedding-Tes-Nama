// ==============================================
// BAGIAN 0: KONFIGURASI FIREBASE
// ==============================================
const firebaseConfig = {
  apiKey: "AIzaSyBwFAisLX2RnRuX7Of-vPKx2oyU4ALzjLQ",
  authDomain: "undangan-demo.firebaseapp.com",
  databaseURL: "https://undangan-demo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "undangan-demo",
  storageBucket: "undangan-demo.firebasestorage.app",
  messagingSenderId: "617661550996",
  appId: "1:617661550996:web:43c80467b303c958787f81"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();


// ==============================================
// BAGIAN 1: LOGIKA UNTUK PRELOADER
// ==============================================
window.onload = function() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('hidden');
    setTimeout(() => { preloader.style.display = 'none'; }, 800);
  }
};


// =================================================================
// BAGIAN 2: LOGIKA UTAMA UNTUK SEMUA INTERAKSI HALAMAN
// =================================================================
document.addEventListener("DOMContentLoaded", function () {
  // --- Inisialisasi Library ---
  if (typeof AOS !== 'undefined') { AOS.init(); }
  
  // PERBAIKAN FINAL ADA DI BLOK INI
  if (typeof dayjs !== 'undefined') {
    dayjs.extend(window.dayjs_plugin_relativeTime);
    dayjs.extend(window.dayjs_plugin_updateLocale); // AKTIFKAN PLUGIN UPDATE LOCALE
    dayjs.locale('id');
    
    // Modifikasi terjemahan 'satu' menjadi angka '1'
    dayjs.updateLocale('id', {
      relativeTime: {
        future: "dalam %s",
        past: "%s yang lalu",
        s: 'beberapa detik',
        m: "1 menit",
        mm: "%d menit",
        h: "1 jam",
        hh: "%d jam",
        d: "1 hari",
        dd: "%d hari",
        M: "1 bulan",
        MM: "%d bulan",
        y: "1 tahun",
        yy: "%d tahun"
      }
    });
  }

  document.body.classList.add('scroll-lock');

  // Variabel untuk rekap RSVP
  let totalKomentar = 0;
  let jumlahHadir = 0;
  let jumlahTidakHadir = 0;

  // --- Ambil semua elemen utama ---
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('untuk');
  const guestNameElement = document.getElementById('nama-tamu');
  const rsvpNameInput = document.getElementById('nama');
  const openButton = document.querySelector(".open-button");
  const invitationCover = document.querySelector(".invitation-cover");
  const mainContent = document.getElementById("main-content");
  const bottomNav = document.getElementById("bottom-nav");
  const backgroundMusic = document.getElementById("background-music");
  const musicToggleButton = document.getElementById("music-toggle");
  
  // --- Logika Nama Tamu ---
  if (guestName) {
    if (guestNameElement) { guestNameElement.innerText = guestName.replace(/\+/g, " "); }
    if (rsvpNameInput) { rsvpNameInput.value = guestName.replace(/\+/g, " "); }
  }

  // --- Logika Tombol "Buka Undangan" ---
  if (openButton) {
    openButton.addEventListener("click", function (event) {
      event.preventDefault();
      invitationCover.classList.add("fade-out");
      mainContent.classList.add("visible");
      bottomNav.classList.add("visible");
      musicToggleButton.classList.add("visible");
      if (backgroundMusic) { backgroundMusic.play().catch(e => {}); }
      document.body.classList.remove('scroll-lock');
      setTimeout(() => {
        invitationCover.style.display = 'none';
        if (typeof AOS !== 'undefined') { AOS.refresh(); }
      }, 1000);
    });
  }

  // --- Logika Navigasi Bawah & Highlight Aktif ---
  const navLinks = document.querySelectorAll('.bottom-nav .nav-item');
  const sections = document.querySelectorAll('main#main-content section');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href').substring(1) === entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(section => { observer.observe(section); });

  // --- Logika Hitung Mundur (Countdown) ---
  if (document.getElementById('countdown')) {
    simplyCountdown('#countdown', {
        year: 2025, month: 11, day: 15,
        words: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' },
        plural: false, enableUtc: false
    });
  }

  // --- Logika Tombol Kontrol Musik ---
  let isMusicPlaying = true;
  const musicIcon = musicToggleButton.querySelector("i");
  if (musicIcon) { musicIcon.classList.add('spinning'); }
  
  if (musicToggleButton) {
    musicToggleButton.addEventListener("click", function() {
      if (isMusicPlaying) {
        backgroundMusic.pause();
        musicIcon.classList.remove('spinning', 'fa-compact-disc');
        musicIcon.classList.add('fa-pause');
      } else {
        backgroundMusic.play();
        musicIcon.classList.add('spinning', 'fa-compact-disc');
        musicIcon.classList.remove('fa-pause');
      }
      isMusicPlaying = !isMusicPlaying;
    });
  }

  // --- Logika Tombol Salin No. Rekening ---
  const copyButtons = document.querySelectorAll('[data-rekening]');
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const rekening = button.getAttribute('data-rekening');
      navigator.clipboard.writeText(rekening).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = 'Berhasil Disalin!';
        setTimeout(() => { button.innerHTML = originalText; }, 2000);
      }).catch(err => { console.error('Gagal menyalin: ', err); });
    });
  });
  
  // --- Logika RSVP & Komentar ---
  const rsvpForm = document.getElementById('rsvp-form');
  const commentList = document.getElementById('comment-list');
  const totalKomentarEl = document.getElementById('total-komentar');
  const totalHadirEl = document.getElementById('total-hadir');
  const totalTidakHadirEl = document.getElementById('total-tidakhadir');
  const commentsRef = database.ref('komentar').orderByChild('timestamp');

  function updateRSVPCounter() {
    if(totalKomentarEl) totalKomentarEl.innerText = totalKomentar;
    if(totalHadirEl) totalHadirEl.innerText = jumlahHadir;
    if(totalTidakHadirEl) totalTidakHadirEl.innerText = jumlahTidakHadir;
  }

  commentsRef.once('value', (snapshot) => {
    const comments = snapshot.val();
    if (comments) {
      totalKomentar = Object.keys(comments).length;
      jumlahHadir = Object.values(comments).filter(c => c.kehadiran === 'Hadir').length;
      jumlahTidakHadir = totalKomentar - jumlahHadir;
      updateRSVPCounter();
    }
  });

  commentsRef.on('child_added', function(snapshot) {
    const comment = snapshot.val();
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('comment-item');
    
    let statusBadge = '';
    if (comment.kehadiran === 'Hadir') {
      statusBadge = `<span class="attendance-badge hadir"><i class="fa-solid fa-check"></i></span>`;
    } else if (comment.kehadiran === 'Tidak Hadir') {
      statusBadge = `<span class="attendance-badge tidak-hadir"><i class="fa-solid fa-times"></i></span>`;
    }

    const safeName = document.createTextNode(comment.nama).textContent;
    const safeUcapan = document.createTextNode(comment.ucapan).textContent;
    const relativeTime = typeof dayjs === 'undefined' ? '' : dayjs(comment.timestamp).fromNow();

    commentDiv.innerHTML = `
      <div class="comment-header">
        <strong>${safeName}</strong>
        ${statusBadge}
      </div>
      <p class="comment-body">${safeUcapan}</p>
      <div class="comment-time">
        <i class="fa-regular fa-clock"></i>
        <span>${relativeTime}</span>
      </div>
    `;
    if (commentList) commentList.prepend(commentDiv);
  });
  
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const namaInput = document.getElementById('nama');
      const ucapanInput = document.getElementById('ucapan');
      const kehadiranInput = document.querySelector('input[name="kehadiran"]:checked');

      if(namaInput.value.trim() && ucapanInput.value.trim() && kehadiranInput) {
        database.ref('komentar').push({
          nama: namaInput.value,
          ucapan: ucapanInput.value,
          kehadiran: kehadiranInput.value,
          timestamp: new Date().toISOString()
        }).then(() => {
          totalKomentar++;
          if (kehadiranInput.value === 'Hadir') jumlahHadir++;
          else jumlahTidakHadir++;
          updateRSVPCounter();
        }).catch(error => {
            console.error("Firebase write failed:", error);
            alert("Gagal mengirim komentar.");
        });

        ucapanInput.value = '';
        kehadiranInput.checked = false;
        alert('Terima kasih atas ucapan dan konfirmasinya!');
      } else {
        alert('Harap isi semua kolom: Nama, Konfirmasi Kehadiran, dan Ucapan.');
      }
    });
  }
});