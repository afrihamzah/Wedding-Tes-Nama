document.addEventListener("DOMContentLoaded", function () {
  AOS.init();
  document.body.classList.add('scroll-lock');

  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('untuk');
  if (guestName) {
    const guestNameElement = document.getElementById('nama-tamu');
    if (guestNameElement) {
      guestNameElement.innerText = guestName.replace(/\+/g, " ");
    }
  }

  const openButton = document.querySelector(".open-button");
  const invitationCover = document.querySelector(".invitation-cover");
  const mainContent = document.getElementById("isi-undangan");
  const backgroundMusic = document.getElementById("background-music");
  const musicToggleButton = document.getElementById("music-toggle");
  const musicIcon = musicToggleButton.querySelector("i");

  let isMusicPlaying = false;

  openButton.addEventListener("click", function (event) {
    event.preventDefault();
    invitationCover.classList.add("fade-out");

    backgroundMusic.play().catch(e => console.log("Autoplay dicegah browser."));
    isMusicPlaying = true;
    musicIcon.classList.add('spinning');

    // Setelah transisi cover dimulai, kita siapkan kemunculan elemen lain
    setTimeout(() => {
      // Tampilkan konten utama
      mainContent.classList.add("visible");
      
      // PERUBAHAN DI SINI: Gunakan kelas .visible untuk memicu transisi
      musicToggleButton.classList.add("visible");
      
      // Buka kunci scroll
      document.body.classList.remove('scroll-lock');
      
      AOS.refresh();
      
    }, 1000); // Durasi dibuat sama agar terasa sinkron
  });

  musicToggleButton.addEventListener("click", function() {
    if (isMusicPlaying) {
      backgroundMusic.pause();
      musicIcon.classList.remove('spinning');
      musicIcon.classList.remove('fa-compact-disc');
      musicIcon.classList.add('fa-pause');
    } else {
      backgroundMusic.play();
      musicIcon.classList.add('spinning');
      musicIcon.classList.remove('fa-pause');
      musicIcon.classList.add('fa-compact-disc');
    }
    isMusicPlaying = !isMusicPlaying;
  });

});