// Ganti URL Web App Google Apps Script Anda
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";

// PASSWORD UTAMA AKSES APLIKASI (Ubah sesuai keinginan Anda)
const APP_PASSWORD = "penilaian2026"; 

document.addEventListener("DOMContentLoaded", () => {
  const sectionLogin = document.getElementById("sectionLogin");
  const sectionApp = document.getElementById("sectionApp");
  const formLogin = document.getElementById("formLogin");
  const inputPassword = document.getElementById("inputPassword");
  const btnLogout = document.getElementById("btnLogout");

  const inputEmail = document.getElementById("inputEmail");
  const selectPenilai = document.getElementById("selectPenilai");
  const containerTabel = document.getElementById("containerTabel");
  const tbodyPegawai = document.getElementById("tbodyPegawai");
  const mobileCardsPegawai = document.getElementById("mobileCardsPegawai");
  const formPenilaian = document.getElementById("formPenilaian");
  const btnSubmit = document.getElementById("btnSubmit");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const btnText = document.getElementById("btnText");

  // Cek apakah penilai sudah pernah login sebelumnya di browser ini
  if (sessionStorage.getItem("isLoggedIn") === "true") {
    sectionLogin.classList.add("hidden");
    sectionApp.classList.remove("hidden");
  }

  // Handle Login Submit
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const enteredPassword = inputPassword.value.trim();

    if (enteredPassword === APP_PASSWORD) {
      sessionStorage.setItem("isLoggedIn", "true");
      sectionLogin.classList.add("hidden");
      sectionApp.classList.remove("hidden");
      inputPassword.value = "";
    } else {
      alert("Password salah! Silakan coba lagi.");
      inputPassword.value = "";
      inputPassword.focus();
    }
  });

  // Handle Logout / Ganti Akun
  btnLogout.addEventListener("click", () => {
    sessionStorage.removeItem("isLoggedIn");
    sectionApp.classList.add("hidden");
    sectionLogin.classList.remove("hidden");
    formPenilaian.reset();
    containerTabel.classList.add("hidden");
  });

  // Populate Dropdown Penilai dari data.js
  if (typeof DATA_PENILAIAN !== "undefined") {
    Object.keys(DATA_PENILAIAN).forEach((penilai) => {
      const option = document.createElement("option");
      option.value = penilai;
      option.textContent = penilai;
      selectPenilai.appendChild(option);
    });
  }

  // Event Listener saat Penilai dipilih
  selectPenilai.addEventListener("change", (e) => {
    const penilaiDipilih = e.target.value;
    const daftarPegawai = DATA_PENILAIAN[penilaiDipilih] || [];

    tbodyPegawai.innerHTML = "";
    mobileCardsPegawai.innerHTML = "";

    daftarPegawai.forEach((pegawai, index) => {
      // 1. Render Tampilan Desktop (Tabel)
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50/80 transition-colors";
      tr.innerHTML = `
        <td class="py-3 px-4 text-center text-slate-500 font-medium">${index + 1}</td>
        <td class="py-3 px-4 font-medium text-slate-800">${pegawai}</td>
        <td class="py-3 px-4">
          <input type="number" min="0" max="100" required 
                 name="kinerja_${index}" 
                 class="val-input w-full text-center border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" 
                 placeholder="0 - 100">
        </td>
        <td class="py-3 px-4">
          <input type="number" min="0" max="100" required 
                 name="perilaku_${index}" 
                 class="val-input w-full text-center border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all shadow-sm" 
                 placeholder="0 - 100">
        </td>
      `;
      tbodyPegawai.appendChild(tr);

      // 2. Render Tampilan Mobile (Card)
      const card = document.createElement("div");
      card.className = "bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3";
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 pb-2">
          <span class="text-xs font-semibold text-slate-400">#${index + 1}</span>
          <h4 class="text-sm font-bold text-slate-800">${pegawai}</h4>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kinerja</label>
            <input type="number" min="0" max="100" required 
                   name="mobile_kinerja_${index}" 
                   class="val-input w-full bg-white text-center border border-slate-300 rounded-lg py-2 px-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                   placeholder="0-100">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Perilaku</label>
            <input type="number" min="0" max="100" required 
                   name="mobile_perilaku_${index}" 
                   class="val-input w-full bg-white text-center border border-slate-300 rounded-lg py-2 px-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                   placeholder="0-100">
          </div>
        </div>
      `;
      mobileCardsPegawai.appendChild(card);
    });

    initValidationAndSync(daftarPegawai.length);
    containerTabel.classList.remove("hidden");
  });

  // Validasi rentang 0-100 & Sinkronisasi Mobile/Desktop Input
  function initValidationAndSync(total) {
    const allInputs = document.querySelectorAll(".val-input");

    allInputs.forEach(input => {
      input.addEventListener("input", (e) => {
        let val = Number(e.target.value);
        if (e.target.value !== "" && (val < 0 || val > 100)) {
          e.target.classList.add("border-red-500", "bg-red-50", "text-red-900");
          e.target.setCustomValidity("Nilai harus berada di antara 0 sampai 100!");
        } else {
          e.target.classList.remove("border-red-500", "bg-red-50", "text-red-900");
          e.target.setCustomValidity("");
        }
      });
    });

    for (let i = 0; i < total; i++) {
      const deskKinerja = document.querySelector(`input[name="kinerja_${i}"]`);
      const deskPerilaku = document.querySelector(`input[name="perilaku_${i}"]`);
      const mobKinerja = document.querySelector(`input[name="mobile_kinerja_${i}"]`);
      const mobPerilaku = document.querySelector(`input[name="mobile_perilaku_${i}"]`);

      if (deskKinerja && mobKinerja) {
        deskKinerja.addEventListener("input", (e) => { mobKinerja.value = e.target.value; mobKinerja.dispatchEvent(new Event('input')); });
        mobKinerja.addEventListener("input", (e) => { deskKinerja.value = e.target.value; deskKinerja.dispatchEvent(new Event('input')); });
      }
      if (deskPerilaku && mobPerilaku) {
        deskPerilaku.addEventListener("input", (e) => { mobPerilaku.value = e.target.value; mobPerilaku.dispatchEvent(new Event('input')); });
        mobPerilaku.addEventListener("input", (e) => { deskPerilaku.value = e.target.value; deskPerilaku.dispatchEvent(new Event('input')); });
      }
    }
  }

  // Handling Submit Form
  formPenilaian.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const penilai = selectPenilai.value;

    if (!email) {
      alert("Mohon masukkan email penilai!");
      inputEmail.focus();
      return;
    }

    const allInputs = document.querySelectorAll(".val-input");
    let isValid = true;
    allInputs.forEach(input => {
      let val = Number(input.value);
      if (input.value === "" || val < 0 || val > 100) {
        input.classList.add("border-red-500", "bg-red-50");
        isValid = false;
      }
    });

    if (!isValid) {
      alert("Mohon periksa kembali! Semua nilai harus diisi angka valid antara 0 sampai 100.");
      return;
    }

    const rows = tbodyPegawai.querySelectorAll("tr");
    const payload = {
      timestamp: new Date().toISOString(),
      email: email,
      penilai: penilai,
      penilaian: []
    };

    rows.forEach((row, index) => {
      const namaPegawai = row.children[1].textContent;
      const nilaiKinerja = row.querySelector(`input[name="kinerja_${index}"]`).value;
      const nilaiPerilaku = row.querySelector(`input[name="perilaku_${index}"]`).value;

      payload.penilaian.push({
        pegawai: namaPegawai,
        kinerja: Number(nilaiKinerja),
        perilaku: Number(nilaiPerilaku)
      });
    });

    // Loading State
    btnSubmit.disabled = true;
    loadingSpinner.classList.remove("hidden");
    btnText.textContent = "Mengirim Penilaian...";

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert("Penilaian berhasil dikirim!");
      formPenilaian.reset();
      containerTabel.classList.add("hidden");
    } catch (error) {
      alert("Gagal mengirim data. Silakan periksa koneksi internet Anda.");
      console.error(error);
    } finally {
      btnSubmit.disabled = false;
      loadingSpinner.classList.add("hidden");
      btnText.textContent = "Kirim Penilaian";
    }
  });
});