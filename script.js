// Menjalankan kode setelah semua elemen halaman dimuat
document.addEventListener("DOMContentLoaded", function() {

    // Ambil objek parameter dari URL saat ini
    const urlParams = new URLSearchParams(window.location.search);
    
    // Ambil nilai dari parameter bernama 'untuk'
    // Nama 'untuk' harus sama dengan yang Anda gunakan di Google Sheet
    const guestName = urlParams.get('untuk');

    // Cari elemen HTML dengan id 'nama-tamu'
    const guestNameElement = document.getElementById('nama-tamu');

    // Cek apakah parameter 'untuk' ada di URL dan tidak kosong
    if (guestName) {
        // Jika ada, tampilkan nama tamu tersebut.
        // Ganti tanda '+' menjadi spasi agar nama tampil dengan benar
        guestNameElement.innerText = guestName.replace(/\+/g, ' ');
    }
    // Jika tidak ada parameter, maka elemen akan menampilkan teks default dari HTML
    // yaitu "Tamu Undangan"

    // Fungsi untuk tombol "Buka Undangan" agar scroll ke bawah
    const openButton = document.querySelector('.open-button');
    openButton.addEventListener('click', function(event) {
        event.preventDefault(); // Mencegah perilaku default link
        
        const targetElement = document.querySelector(openButton.getAttribute('href'));
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth' // Efek scroll haluss
            });
        }
    });

});