document.getElementById('formDaftar').addEventListener('submit', async function (e) {
  e.preventDefault(); // Mencegah reload halaman

  const nis = document.getElementById('nis').value.trim();
  const nama = document.getElementById('nama').value.trim();
  const divisi = document.getElementById('divisi').value;
  const email = document.getElementById('email').value.trim();

  const errNis = document.getElementById('errNis');
  const errEmail = document.getElementById('errEmail');
  const msgBox = document.getElementById('responseMessage');
  const btnSubmit = document.getElementById('btnSubmit');

  // Reset pesan error setiap kali submit
  errNis.classList.add('hidden');
  errEmail.classList.add('hidden');
  msgBox.classList.add('hidden');

  // Validasi Client-Side (RegEx 8 Digit Angka)
  const nisRegex = /^[0-9]{8}$/;
  let isValid = true;

  if (!nisRegex.test(nis)) {
    errNis.classList.remove('hidden');
    isValid = false;
  }

  // Validasi Client-Side format email (basic RegEx)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errEmail.classList.remove('hidden');
    isValid = false;
  }

  if (!isValid) return;

  // JSON Payload
  const payload = { nis, nama, divisi, email };

  // Nonaktifkan tombol saat proses pengiriman berlangsung (mencegah double-submit)
  btnSubmit.disabled = true;
  btnSubmit.innerText = 'MENGIRIM...';

  try {
    const response = await fetch('api.php?action=daftar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // BUG FIX: sebelumnya kode langsung memanggil response.json() tanpa
    // memeriksa status HTTP. Jika server mengembalikan error non-JSON
    // (mis. 500 Internal Server Error dari PHP), response.json() akan
    // melempar exception yang tidak informatif. Sekarang kita cek dulu.
    if (!response.ok) {
      throw new Error(`Server merespons dengan status ${response.status}`);
    }

    const result = await response.json();

    msgBox.classList.remove('hidden');
    if (result.status === 'success') {
      msgBox.className = 'mt-4 p-3 rounded-lg text-sm text-center font-medium bg-emerald-950 border border-emerald-500 text-emerald-300';
      msgBox.innerText = result.message;
      document.getElementById('formDaftar').reset();
    } else {
      msgBox.className = 'mt-4 p-3 rounded-lg text-sm text-center font-medium bg-rose-950 border border-rose-500 text-rose-300';
      msgBox.innerText = result.message;
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    msgBox.classList.remove('hidden');
    msgBox.className = 'mt-4 p-3 rounded-lg text-sm text-center font-medium bg-rose-950 border border-rose-500 text-rose-300';
    msgBox.innerText = 'Terjadi kesalahan koneksi ke server backend!';
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = 'KIRIM PENDAFTARAN';
  }
});