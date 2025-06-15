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
  if (typeof AOS !== 'undefined') { AOS.init(); }
  document.body.classList.add('scroll-lock');

  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('untuk');
  if (guestName) {
    const guestNameElement = document.getElementById('nama-tamu');
    const rsvpNameInput = document.getElementById('nama');
    if (guestNameElement) { guestNameElement.innerText = guestName.replace(/\+/g, " "); }
    if (rsvpNameInput) { rsvpNameInput.value = guestName.replace(/\+/g, " "); }
  }

  const openButton = document.querySelector(".open-button");
  const invitationCover = document.querySelector(".invitation-cover");
  const mainContent = document.getElementById("main-content");
  const bottomNav = document.getElementById("bottom-nav");
  const backgroundMusic = document.getElementById("background-music");
  const musicToggleButton = document.getElementById("music-toggle");
  
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

  // --- Logika Hitung Mundur (Countdown) - DIPERBAIKI ---
  if (document.getElementById('countdown')) {
    simplyCountdown('#countdown', {
        year: 2025, month: 11, day: 15,
        words: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' },
        plural: false, enableUtc: false
    });
  }

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
  
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const namaInput = document.getElementById('nama');
      const ucapanInput = document.getElementById('ucapan');
      
      if(namaInput.value.trim() && ucapanInput.value.trim()) {
        database.ref('komentar').push({
          nama: namaInput.value,
          ucapan: ucapanInput.value,
          timestamp: new Date().toISOString()
        }).catch(error => {
            console.error("Firebase write failed:", error);
            alert("Gagal mengirim komentar. Silakan coba lagi.");
        });
        ucapanInput.value = '';
        alert('Terima kasih atas ucapan dan doanya!');
      } else {
        alert('Harap isi nama dan ucapan Anda.');
      }
    });
  }

  const commentList = document.getElementById('comment-list');
  if (commentList) {
    const commentsRef = database.ref('komentar').orderByChild('timestamp').limitToLast(50);
    commentsRef.on('child_added', function(snapshot) {
      const comment = snapshot.val();
      const commentDiv = document.createElement('div');
      commentDiv.classList.add('comment-item');
      const safeName = document.createTextNode(comment.nama).textContent;
      const safeUcapan = document.createTextNode(comment.ucapan).textContent;
      commentDiv.innerHTML = `<strong>${safeName}</strong><p>${safeUcapan}</p>`;
      commentList.prepend(commentDiv);
    }, error => {
        console.error("Firebase read failed:", error);
    });
  }

});