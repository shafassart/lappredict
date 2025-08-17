// Store user selections
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

// Back buttons
function backToUserType() {
  hideAllSections();
  document.getElementById("userTypeSelection").classList.remove("hidden");
}

function backToUsageType() {
  hideAllSections();
  document.getElementById("noviceUsageType").classList.remove("hidden");
}

// Usage type selection for novice users
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
  // Get form data
  const formData = new FormData(document.getElementById("noviceForm"));
  const data = Object.fromEntries(formData.entries());

  // Generate specification summary
  generateSpecSummary(data, true);

  // Show results
  hideAllSections();
  document.getElementById("resultsContainer").classList.remove("hidden");
}

// function submit expert
function submitExpertForm() {
  const formData = new FormData(document.getElementById("expertForm"));
  const data = Object.fromEntries(formData.entries());

  // Pastikan nilai numeric tidak kosong
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

      // Update price prediction result
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

// // Generate specification summary for results
function generateSpecSummary(data, isNovice) {
  const specSummary = document.getElementById("specSummary");
  specSummary.innerHTML = "";

  if (isNovice) {
    // Nama kategori sesuai HTML
    const usageType = {
      daily: "Sehari-hari",
      gaming: "Bermain Game",
      design: "Desain Grafis",
      work: "Perkantoran",
    };

    const budget = {
      low: "Entry Level (Rp 5-10 juta)",
      medium: "Mid Range (Rp 10-20 juta)",
      high: "High End (Rp 20-30 juta)",
      premium: "Premium (Rp 30+ juta)",
    };

    const intensity = {
      light: "Ringan",
      moderate: "Sedang",
      heavy: "Berat",
    };

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

    // Set harga berdasarkan logika baru
    const pricePrediction = document.getElementById("pricePrediction");
    pricePrediction.innerHTML = `
      <p class="text-3xl font-bold text-blue-600">
        ${getPriceRangeForNovice(data.usageType, data.budget, data.intensity)}
      </p>
      <p class="text-gray-600 mt-2">Berdasarkan rekomendasi model</p>
    `;
  } else {
    // Expert user summary
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

function getPriceRangeForNovice(usageType, budget, intensity) {
  const priceRanges = {
    daily: {
      low: { min: 5000000, max: 8000000 },
      medium: { min: 8000000, max: 12000000 },
      high: { min: 12000000, max: 18000000 },
      premium: { min: 18000000, max: 25000000 },
    },
    gaming: {
      low: { min: 8000000, max: 12000000 },
      medium: { min: 12000000, max: 20000000 },
      high: { min: 20000000, max: 30000000 },
      premium: { min: 30000000, max: 50000000 },
    },
    design: {
      low: { min: 10000000, max: 15000000 },
      medium: { min: 15000000, max: 25000000 },
      high: { min: 25000000, max: 40000000 },
      premium: { min: 40000000, max: 60000000 },
    },
    work: {
      low: { min: 7000000, max: 10000000 },
      medium: { min: 10000000, max: 15000000 },
      high: { min: 15000000, max: 25000000 },
      premium: { min: 25000000, max: 40000000 },
    },
  };

  const intensityFactors = {
    light: 0.9,
    moderate: 1.0,
    heavy: 1.1,
  };

  const range = priceRanges[usageType]?.[budget];
  if (!range) return "Rp -";

  const factor = intensityFactors[intensity] || 1.0;
  const minPrice = Math.floor(range.min * factor);
  const maxPrice = Math.floor(range.max * factor);

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
