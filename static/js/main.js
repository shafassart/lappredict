// variable tipe user dan kategori
let userType = "";
let usageType = "";

// Show/hide sections
function hideAllSections() {
  document.getElementById("userTypeSelection").classList.add("hidden");
  document.getElementById("noviceUsageType").classList.add("hidden");
  document.getElementById("noviceFormContainer").classList.add("hidden");
  document.getElementById("expertFormContainer").classList.add("hidden");
  document.getElementById("resultsContainer").classList.add("hidden");
}

// User type selection
function selectUserType(type) {
  userType = type;
  hideAllSections();

  if (type === "novice") {
    document.getElementById("noviceUsageType").classList.remove("hidden");
  } else {
    document.getElementById("expertFormContainer").classList.remove("hidden");
  }
}

// tombol kembali
function backToUserType() {
  hideAllSections();
  document.getElementById("userTypeSelection").classList.remove("hidden");
}

function backToUsageType() {
  hideAllSections();
  document.getElementById("noviceUsageType").classList.remove("hidden");
}

// kategori pengguna awam
function selectUsageType(type) {
  usageType = type;
  document.getElementById("usageType").value = type;
  hideAllSections();
  document.getElementById("noviceFormContainer").classList.remove("hidden");

  // Update form title based on usage type
  const titles = {
    daily: "Sehari-hari",
    work: "Bekerja",
    design: "Desain",
    gaming: "Gaming",
  };
  document
    .getElementById("noviceFormContainer")
    .querySelector(
      "h2"
    ).textContent = `Konfigurasi Kebutuhan Laptop ${titles[type]} Anda`;
}

// Form submission handlers
function submitNoviceForm() {
  console.log("Fungsi kepanggil"); // cek apakah tombol nyambung ke fungsi

  const form = document.getElementById("noviceForm");
  if (!form) {
    console.error("noviceForm tidak ditemukan");
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  console.log("Data form:", data);

  if (!data.intensity) {
    alert("Harap pilih intensitas penggunaan anda!");
    return;
  }
  if (!data.budget) {
    alert("Harap pilih budget Anda!");
    return;
  }

  console.log("Validasi lolos, lanjut ke generateSpecSummary");

  generateSpecSummary(data, true);
  hideAllSections();
  document.getElementById("resultsContainer").classList.remove("hidden");
}

// function submit expert
function submitExpertForm() {
  const formData = new FormData(document.getElementById("expertForm"));
  const data = Object.fromEntries(formData.entries());

  const required = {
    prosessor: "Harap pilih prosessor!",
    ram: "Harap pilih kapasitas RAM!",
    hdd: "Harap pilih kapasitas HDD!",
    ssd: "Harap pilih kapasitas SSD!",
    ips: "Harap tentukan apakah menggunakan panel IPS!",
    kartu_grafis: "Harap pilih kartu grafis (GPU)!",
    resolution: "Harap pilih resolusi layar!",
    weight: "Harap masukkan berat laptop!",
    ppi: "Harap masukkan nilai PPI layar!",
  };

  for (const key in required) {
    if (!data[key]) {
      alert(required[key]);
      return;
    }
  }

  // memastikan nilai numeric tidak kosong
  data.ppi = data.ppi || "0";
  data.touchscreen = data.touchscreen || "0";
  data.weight = data.weight || "0";

  fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.error) {
        alert("Error: " + result.error);
        return;
      }

      // Update harga dari backend
      document.getElementById("pricePrediction").innerHTML = `
        <p class="text-3xl font-bold text-blue-600">
          Rp${result.min_price.toLocaleString()} - Rp${result.max_price.toLocaleString()}
        </p>
        <p class="text-gray-600 mt-2">
          Berdasarkan prediksi model machine learning
        </p>
      `;

      // Tampilkan ringkasan spesifikasi
      generateSpecSummary(data, false);

      // Tampilkan container hasil
      hideAllSections();
      document.getElementById("resultsContainer").classList.remove("hidden");
    })
    .catch((err) => {
      console.error("Error saat request ke server:", err);
      alert("Terjadi kesalahan saat memproses prediksi");
    });
}

// ringkasan spesifikasi
function generateSpecSummary(data, isNovice) {
  const specSummary = document.getElementById("specSummary");
  specSummary.innerHTML = "";

  if (isNovice) {
    // Nama kategori
    const usageType = {
      daily: "Sehari-hari",
      gaming: "Bermain Game",
      design: "Desain Grafis",
      work: "Perkantoran",
    };

    // budget
    const budget = {
      low: "Rp 5-10 juta (Entry Level)",
      medium: "Rp 10-20 juta (Mid Range)",
      high: "Rp 20-30 juta (High End)",
      premium: "Rp 30+ juta (Premium)",
    };

    // intensitas
    const intensity = {
      light: "Ringan",
      moderate: "Sedang",
      heavy: "Berat",
    };

    // ringkasan spesifikasi awam
    const summaryItems = [
      { label: "Kategori", value: usageType[data.usageType] || "N/A" },
      { label: "Budget", value: budget[data.budget] || "N/A" },
      { label: "Intensitas", value: intensity[data.intensity] || "N/A" },
      {
        label: "Preferensi Merek",
        value: data.brand || "Tidak ada preferensi",
      },
      {
        label: "Ukuran Layar",
        value: data.screenSize ? data.screenSize + '"' : "Tidak ada preferensi",
      },
    ];

    summaryItems.forEach((item) => {
      specSummary.innerHTML += `
        <div class="flex justify-between py-2 border-b">
          <span class="text-gray-600">${item.label}</span>
          <span class="font-medium">${item.value}</span>
        </div>
      `;
    });

    // Set harga pengguna awam
    const pricePrediction = document.getElementById("pricePrediction");
    pricePrediction.innerHTML = `
      <p class="text-3xl font-bold text-blue-600">
        ${getPriceRangeForNovice(data.usageType, data.budget, data.intensity)}
      </p>
      <p class="text-gray-600 mt-2">Rentang harga laptop yang sesuai kebutuhan Anda adalah</p>
    `;
  } else {
    // Expert user
    const summaryItems = [
      { label: "Prosessor", value: `${data.prosessor}` },
      { label: "RAM", value: `${data.ram} GB` },
      { label: "HDD", value: `${data.hdd} GB` },
      { label: "SSD", value: `${data.ssd} GB` },
      { label: "IPS", value: `${data.ips} ` },
      { label: "GPU", value: `${data.kartu_grafis}` },
      { label: "Ukuran Layar", value: `${data.ukuran_layar}"` },
      { label: "Resolusi", value: data.resolution },
      {
        label: "Merek/Brand",
        value: data.brandexpert || "Tidak Ada Preferensi",
      },
      { label: "Berat", value: `${data.weight} kg` },
      { label: "PPI", value: `${data.ppi}` },
      { label: "Layar sentuh", value: `${data.touchscreen}` },
    ];

    summaryItems.forEach((item) => {
      specSummary.innerHTML += `
        <div class="flex justify-between py-2 border-b">
          <span class="text-gray-600">${item.label}</span>
          <span class="font-medium">${item.value}</span>
        </div>
      `;
    });
  }
}

// set harga pengguna awam berdasarkan dataset
function getPriceRangeForNovice(usageType, budget, intensity) {
  const priceRanges = {
    daily: {
      low: { min: 5004000, max: 9954000 },
      medium: { min: 10032660, max: 19890000 },
      high: { min: 20105820, max: 29700000 },
      premium: { min: 30042000, max: 55800000 },
    },
    gaming: {
      low: { min: 5003820, max: 9899820 },
      medium: { min: 10170000, max: 19962000 },
      high: { min: 20088360, max: 29790000 },
      premium: { min: 30222000, max: 109782000 },
    },
    design: {
      low: { min: 10000000, max: 15000000 },
      medium: { min: 15000000, max: 25000000 },
      high: { min: 20772000, max: 28098000 },
      premium: { min: 40000000, max: 60000000 },
    },
    work: {
      low: { min: 8262000, max: 9882000 },
      medium: { min: 10152000, max: 19782000 },
      high: { min: 20124000, max: 27882000 },
      premium: { min: 31752000, max: 44010000 },
    },
  };

  const intensityFactors = {
    light: 0.95,
    moderate: 1.0,
    heavy: 1.05,
  };

  const range = priceRanges[usageType]?.[budget];
  if (!range) return "Rp -";

  const factor = intensityFactors[intensity] || 1.0;
  let minPrice = Math.floor(range.min * factor);
  let maxPrice = Math.floor(range.max * factor);

  //Memastikan tidak keluar dari range aslinya
  if (minPrice < range.min) minPrice = range.min;
  if (maxPrice > range.max) maxPrice = range.max;

  return `Rp${minPrice.toLocaleString()} - Rp${maxPrice.toLocaleString()}`;
}

// Reset form and start over
function resetForm() {
  hideAllSections();
  document.getElementById("userTypeSelection").classList.remove("hidden");
  userType = "";
  usageType = "";
  document.getElementById("noviceForm").reset();
  document.getElementById("expertForm").reset();
  document.getElementById("specSummary").innerHTML = "";
  document.getElementById("pricePrediction").innerHTML = "";
}
