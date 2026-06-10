// ==========================================
// LIFELINE BANGLADESH — script.js v8.0
// Backend: Firebase Firestore
// ==========================================

const ADMIN_PASSWORD = "lifeline2025";

// ==========================================
// বাংলাদেশের ৬৪টি জেলা
// ==========================================
const bangladeshDistricts = {
  dhaka:"ঢাকা", gazipur:"গাজীপুর", manikganj:"মানিকগঞ্জ",
  munshiganj:"মুন্সীগঞ্জ", narayanganj:"নারায়ণগঞ্জ", narsingdi:"নরসিংদী",
  faridpur:"ফরিদপুর", gopalganj:"গোপালগঞ্জ", kishoreganj:"কিশোরগঞ্জ",
  madaripur:"মাদারীপুর", rajbari:"রাজবাড়ী", shariatpur:"শরীয়তপুর",
  tangail:"টাঙ্গাইল",
  chittagong:"চট্টগ্রাম", coxsbazar:"কক্সবাজার", bandarban:"বান্দরবান",
  rangamati:"রাঙামাটি", khagrachhari:"খাগড়াছড়ি", brahmanbaria:"ব্রাহ্মণবাড়িয়া",
  comilla:"কুমিল্লা", chandpur:"চাঁদপুর", feni:"ফেনী",
  noakhali:"নোয়াখালী", lakshmipur:"লক্ষ্মীপুর",
  rajshahi:"রাজশাহী", bogura:"বগুড়া", chapainawabganj:"চাঁপাইনবাবগঞ্জ",
  joypurhat:"জয়পুরহাট", naogaon:"নওগাঁ", natore:"নাটোর",
  pabna:"পাবনা", sirajganj:"সিরাজগঞ্জ",
  khulna:"খুলনা", bagerhat:"বাগেরহাট", chuadanga:"চুয়াডাঙ্গা",
  jashore:"যশোর", jhenaidah:"ঝিনাইদহ", kushtia:"কুষ্টিয়া",
  magura:"মাগুরা", meherpur:"মেহেরপুর", narail:"নড়াইল", satkhira:"সাতক্ষীরা",
  barisal:"বরিশাল", barguna:"বরগুনা", bhola:"ভোলা",
  jhalokathi:"ঝালকাঠি", patuakhali:"পটুয়াখালী", pirojpur:"পিরোজপুর",
  sylhet:"সিলেট", habiganj:"হবিগঞ্জ", moulvibazar:"মৌলভীবাজার", sunamganj:"সুনামগঞ্জ",
  rangpur:"রংপুর", dinajpur:"দিনাজপুর", gaibandha:"গাইবান্ধা",
  kurigram:"কুড়িগ্রাম", lalmonirhat:"লালমনিরহাট", nilphamari:"নীলফামারী",
  panchagarh:"পঞ্চগড়", thakurgaon:"ঠাকুরগাঁও",
  mymensingh:"ময়মনসিংহ", jamalpur:"জামালপুর", netrokona:"নেত্রকোণা", sherpur:"শেরপুর"
};

// ==========================================
// Firestore init
// ==========================================
let db;
document.addEventListener("DOMContentLoaded", () => {
  db = firebase.firestore();
  populateDistrictSelects();
  renderEmergency();
  renderHospitals();
  renderFood();
  renderJobs();
  renderPharmacies();
  initDonorForm();
  initJobForm();
  initEmergencyAdminForm();
  initFoodForm();
  initPharmacyForm();
});

// ==========================================
// Dropdown populate
// ==========================================
function populateDistrictSelects() {
  const opts = `<option value="">সব জেলা</option>` +
    Object.entries(bangladeshDistricts).map(([k,v]) =>
      `<option value="${k}">${v}</option>`).join("");

  const natOpts = `<option value="all">সব / জাতীয়</option>` +
    Object.entries(bangladeshDistricts).map(([k,v]) =>
      `<option value="${k}">${v}</option>`).join("");

  ["em-filter-district","blood-area","new-donor-area"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });
  const emD = document.getElementById("em-district");
  if (emD) emD.innerHTML = natOpts;
}

// ==========================================
// HELPERS
// ==========================================
function maskPhone(p) {
  const c = (p||"").replace(/\D/g,"");
  if (c.length < 6) return "নম্বর সুরক্ষিত";
  return c.slice(0,4)+"****"+c.slice(-2);
}

function toast(msg, color="green") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = color==="green" ? "var(--green)" : "var(--red)";
  t.style.opacity = "1";
  t.style.transform = "translateX(-50%) translateY(0) scale(1)";
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-50%) translateY(20px) scale(0.95)";
  }, 3000);
}

// ==========================================
// PAGE NAVIGATION
// ==========================================
let currentPage = "home";
function goPage(name) {
  if (name === currentPage) return;
  const outEl = document.getElementById("page-"+currentPage);
  const inEl  = document.getElementById("page-"+name);
  if (!outEl||!inEl) return;
  outEl.classList.remove("active"); outEl.classList.add("slide-out");
  setTimeout(()=>outEl.classList.remove("slide-out"),240);
  inEl.classList.add("active");
  currentPage = name;
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
  const navEl = document.getElementById("nav-"+name);
  if (navEl) navEl.classList.add("active");
  document.getElementById("fab").classList.toggle("hidden", name!=="blood");
  window.scrollTo({top:0,behavior:"smooth"});
}

// ==========================================
// DISTRICT → UPAZILA CHIPS
// ==========================================
const districtUpazilas = {
  dhaka:           ["সাভার","ধামরাই","কেরানীগঞ্জ","দোহার","নবাবগঞ্জ"],
  gazipur:         ["গাজীপুর সদর","কালীগঞ্জ","কাপাসিয়া","শ্রীপুর","কালিয়াকৈর"],
  narayanganj:     ["নারায়ণগঞ্জ সদর","আড়াইহাজার","বন্দর","রূপগঞ্জ","সোনারগাঁ"],
  manikganj:       ["মানিকগঞ্জ সদর","দৌলতপুর","ঘিওর","হরিরামপুর","সাটুরিয়া","শিবালয়","সিংগাইর"],
  munshiganj:      ["মুন্সীগঞ্জ সদর","গজারিয়া","লৌহজং","শ্রীনগর","সিরাজদিখান","টঙ্গিবাড়ী"],
  narsingdi:       ["নরসিংদী সদর","বেলাব","মনোহরদী","পলাশ","রায়পুরা","শিবপুর"],
  tangail:         ["টাঙ্গাইল সদর","বাসাইল","ভূঞাপুর","দেলদুয়ার","ধনবাড়ী","গোপালপুর","কালিহাতী","মধুপুর","মির্জাপুর","নাগরপুর","সখিপুর"],
  faridpur:        ["ফরিদপুর সদর","আলফাডাঙ্গা","বোয়ালমারী","চরভদ্রাসন","মধুখালী","নগরকান্দা","সদরপুর","সালথা"],
  gopalganj:       ["গোপালগঞ্জ সদর","কাশিয়ানী","কোটালীপাড়া","মুকসুদপুর","টুঙ্গিপাড়া"],
  kishoreganj:     ["কিশোরগঞ্জ সদর","অষ্টগ্রাম","বাজিতপুর","ভৈরব","হোসেনপুর","ইটনা","করিমগঞ্জ","কটিয়াদী","কুলিয়ারচর","মিঠামইন","নিকলী","পাকুন্দিয়া","তাড়াইল"],
  madaripur:       ["মাদারীপুর সদর","কালকিনি","রাজৈর","শিবচর"],
  rajbari:         ["রাজবাড়ী সদর","বালিয়াকান্দি","গোয়ালন্দ","কালুখালী","পাংশা"],
  shariatpur:      ["শরীয়তপুর সদর","ভেদরগঞ্জ","ডামুড্যা","গোসাইরহাট","জাজিরা","নড়িয়া"],
  chittagong:      ["চট্টগ্রাম সদর","আনোয়ারা","বাঁশখালী","বোয়ালখালী","চন্দনাইশ","ফটিকছড়ি","হাটহাজারী","লোহাগাড়া","মিরসরাই","পটিয়া","রাঙ্গুনিয়া","রাউজান","সন্দ্বীপ","সাতকানিয়া","সীতাকুণ্ড"],
  coxsbazar:       ["কক্সবাজার সদর","চকোরিয়া","কুতুবদিয়া","মহেশখালী","পেকুয়া","রামু","টেকনাফ","উখিয়া"],
  brahmanbaria:    ["ব্রাহ্মণবাড়িয়া সদর","আখাউড়া","বাঞ্ছারামপুর","বিজয়নগর","কসবা","নবীনগর","নাসিরনগর","সরাইল","আশুগঞ্জ"],
  comilla:         ["কুমিল্লা সদর","বরুড়া","ব্রাহ্মণপাড়া","বুড়িচং","চান্দিনা","চৌদ্দগ্রাম","দাউদকান্দি","দেবিদ্বার","হোমনা","লাকসাম","মুরাদনগর","নাঙ্গলকোট","তিতাস"],
  chandpur:        ["চাঁদপুর সদর","ফরিদগঞ্জ","হাজীগঞ্জ","কচুয়া","মতলব উত্তর","মতলব দক্ষিণ","শাহরাস্তি"],
  feni:            ["ফেনী সদর","ছাগলনাইয়া","দাগনভুঞা","ফুলগাজী","পরশুরাম","সোনাগাজী"],
  noakhali:        ["নোয়াখালী সদর","বেগমগঞ্জ","চাটখিল","কোম্পানীগঞ্জ","হাতিয়া","কবিরহাট","সেনবাগ","সোনাইমুড়ী","সুবর্ণচর"],
  lakshmipur:      ["লক্ষ্মীপুর সদর","কমলনগর","রামগঞ্জ","রামগতি","রায়পুর"],
  bandarban:       ["বান্দরবান সদর","আলীকদম","লামা","নাইক্ষ্যংছড়ি","রোয়াংছড়ি","রুমা","থানচি"],
  rangamati:       ["রাঙামাটি সদর","বাঘাইছড়ি","বরকল","বিলাইছড়ি","কাউখালী","কাপ্তাই","জুরাছড়ি","লংগদু","নানিয়ারচর","রাজস্থলী"],
  khagrachhari:    ["খাগড়াছড়ি সদর","দীঘিনালা","গুইমারা","লক্ষীছড়ি","মহালছড়ি","মানিকছড়ি","মাটিরাঙ্গা","পানছড়ি","রামগড়"],
  rajshahi:        ["রাজশাহী সদর","বাঘা","বাগমারা","চারঘাট","দুর্গাপুর","গোদাগাড়ী","মোহনপুর","পবা","পুঠিয়া","তানোর"],
  bogura:          ["বগুড়া সদর","আদমদীঘি","ধুনট","দুপচাঁচিয়া","গাবতলী","কাহালু","নন্দীগ্রাম","শাজাহানপুর","শেরপুর","শিবগঞ্জ","সোনাতলা"],
  chapainawabganj: ["চাঁপাইনবাবগঞ্জ সদর","ভোলাহাট","গোমস্তাপুর","নাচোল","শিবগঞ্জ"],
  joypurhat:       ["জয়পুরহাট সদর","আক্কেলপুর","কালাই","ক্ষেতলাল","পাঁচবিবি"],
  naogaon:         ["নওগাঁ সদর","আত্রাই","বদলগাছী","ধামইরহাট","মান্দা","মহাদেবপুর","নিয়ামতপুর","পত্নীতলা","পোরশা","রাণীনগর","সাপাহার"],
  natore:          ["নাটোর সদর","বাগাতিপাড়া","বড়াইগ্রাম","গুরুদাসপুর","লালপুর","সিংড়া"],
  pabna:           ["পাবনা সদর","আটঘরিয়া","বেড়া","ভাঙ্গুড়া","চাটমোহর","ঈশ্বরদী","ফরিদপুর","সাঁথিয়া","সুজানগর"],
  sirajganj:       ["সিরাজগঞ্জ সদর","বেলকুচি","চৌহালী","কামারখন্দ","কাজীপুর","রায়গঞ্জ","শাহজাদপুর","তাড়াশ","উল্লাপাড়া"],
  khulna:          ["খুলনা সদর","বটিয়াঘাটা","ডাকোপ","দিঘলিয়া","দুমুরিয়া","ফুলতলা","কয়রা","পাইকগাছা","রূপসা","তেরখাদা"],
  bagerhat:        ["বাগেরহাট সদর","চিতলমারী","ফকিরহাট","কচুয়া","মোংলা","মোরেলগঞ্জ","মোল্লাহাট","রামপাল","শরণখোলা"],
  chuadanga:       ["চুয়াডাঙ্গা সদর","আলমডাঙ্গা","দামুড়হুদা","জীবননগর"],
  jashore:         ["যশোর সদর","অভয়নগর","বাঘারপাড়া","চৌগাছা","ঝিকরগাছা","কেশবপুর","মণিরামপুর","শার্শা"],
  jhenaidah:       ["ঝিনাইদহ সদর","হরিণাকুণ্ডু","কালীগঞ্জ","কোটচাঁদপুর","মহেশপুর","শৈলকুপা"],
  kushtia:         ["কুষ্টিয়া সদর","ভেড়ামারা","দৌলতপুর","খোকসা","কুমারখালী","মিরপুর"],
  magura:          ["মাগুরা সদর","মহম্মদপুর","শালিখা","শ্রীপুর"],
  meherpur:        ["মেহেরপুর সদর","গাংনী","মুজিবনগর"],
  narail:          ["নড়াইল সদর","কালিয়া","লোহাগড়া"],
  satkhira:        ["সাতক্ষীরা সদর","আশাশুনি","দেবহাটা","কালীগঞ্জ","কলারোয়া","শ্যামনগর","তালা"],
  barisal:         ["বরিশাল সদর","আগৈলঝাড়া","বাকেরগঞ্জ","বাবুগঞ্জ","বানারীপাড়া","গৌরনদী","হিজলা","মেহেন্দিগঞ্জ","মুলাদী","উজিরপুর"],
  barguna:         ["বরগুনা সদর","আমতলী","বামনা","বেতাগী","পাথরঘাটা","তালতলী"],
  bhola:           ["ভোলা সদর","বোরহানউদ্দিন","চরফ্যাশন","দৌলতখান","লালমোহন","মনপুরা","তজুমদ্দিন"],
  jhalokathi:      ["ঝালকাঠি সদর","কাঁঠালিয়া","নলছিটি","রাজাপুর"],
  patuakhali:      ["পটুয়াখালী সদর","বাউফল","দশমিনা","দুমকী","গলাচিপা","কলাপাড়া","মির্জাগঞ্জ","রাঙ্গাবালী"],
  pirojpur:        ["পিরোজপুর সদর","ভান্ডারিয়া","কাউখালী","মঠবাড়িয়া","নাজিরপুর","নেছারাবাদ","জিয়ানগর"],
  sylhet:          ["সিলেট সদর","বালাগঞ্জ","বিয়ানীবাজার","বিশ্বনাথ","কোম্পানীগঞ্জ","ফেঞ্চুগঞ্জ","গোলাপগঞ্জ","গোয়াইনঘাট","জৈন্তাপুর","কানাইঘাট","ওসমানীনগর","জকিগঞ্জ"],
  habiganj:        ["হবিগঞ্জ সদর","আজমিরীগঞ্জ","বাহুবল","বানিয়াচং","চুনারুঘাট","লাখাই","মাধবপুর","নবীগঞ্জ"],
  moulvibazar:     ["মৌলভীবাজার সদর","বড়লেখা","জুড়ী","কমলগঞ্জ","কুলাউড়া","রাজনগর","শ্রীমঙ্গল"],
  sunamganj:       ["সুনামগঞ্জ সদর","বিশ্বম্ভরপুর","ছাতক","দিরাই","দোয়ারাবাজার","জগন্নাথপুর","জামালগঞ্জ","শাল্লা","তাহিরপুর","ধর্মপাশা"],
  rangpur:         ["রংপুর সদর","বদরগঞ্জ","গঙ্গাচড়া","কাউনিয়া","মিঠাপুকুর","পীরগাছা","পীরগঞ্জ","তারাগঞ্জ"],
  dinajpur:        ["দিনাজপুর সদর","বিরামপুর","বিরল","বোচাগঞ্জ","চিরিরবন্দর","ফুলবাড়ী","ঘোড়াঘাট","হাকিমপুর","কাহারোল","খানসামা","নবাবগঞ্জ","পার্বতীপুর"],
  gaibandha:       ["গাইবান্ধা সদর","ফুলছড়ি","গোবিন্দগঞ্জ","পলাশবাড়ী","সাদুল্লাপুর","সাঘাটা","সুন্দরগঞ্জ"],
  kurigram:        ["কুড়িগ্রাম সদর","ভুরুঙ্গামারী","চর রাজিবপুর","চিলমারী","ফুলবাড়ী","নাগেশ্বরী","রাজারহাট","রৌমারী","উলিপুর"],
  lalmonirhat:     ["লালমনিরহাট সদর","আদিতমারী","হাতীবান্ধা","কালীগঞ্জ","পাটগ্রাম"],
  nilphamari:      ["নীলফামারী সদর","ডিমলা","ডোমার","জলঢাকা","কিশোরগঞ্জ","সৈয়দপুর"],
  panchagarh:      ["পঞ্চগড় সদর","আটোয়ারী","বোদা","দেবীগঞ্জ","তেঁতুলিয়া"],
  thakurgaon:      ["ঠাকুরগাঁও সদর","বালিয়াডাঙ্গী","হরিপুর","পীরগঞ্জ","রাণীশংকৈল"],
  mymensingh:      ["ময়মনসিংহ সদর","ভালুকা","ধোবাউড়া","ফুলবাড়িয়া","গফরগাঁও","গৌরীপুর","হালুয়াঘাট","ঈশ্বরগঞ্জ","মুক্তাগাছা","নান্দাইল","ফুলপুর","তারাকান্দা","ত্রিশাল"],
  jamalpur:        ["জামালপুর সদর","বকশীগঞ্জ","দেওয়ানগঞ্জ","ইসলামপুর","মাদারগঞ্জ","মেলান্দহ","সরিষাবাড়ী"],
  netrokona:       ["নেত্রকোণা সদর","আটপাড়া","বারহাট্টা","দুর্গাপুর","খালিয়াজুড়ী","কলমাকান্দা","কেন্দুয়া","মদন","মোহনগঞ্জ","পূর্বধলা"],
  sherpur:         ["শেরপুর সদর","ঝিনাইগাতী","নকলা","নালিতাবাড়ী","শ্রীবরদী"]
};

let selectedUpazila = null;

function onDistrictChange() {
  const districtKey = document.getElementById("blood-area").value;
  const wrap        = document.getElementById("upazila-wrap");
  const chipsEl     = document.getElementById("upazila-chips");
  if (!wrap || !chipsEl) return;

  selectedUpazila = null;

  if (!districtKey) {
    wrap.style.display = "none";
    chipsEl.innerHTML  = "";
    return;
  }

  const upazilas = districtUpazilas[districtKey] || [];
  if (!upazilas.length) {
    wrap.style.display = "none";
    return;
  }

  // "সব" chip + একটি করে upazila chip
  chipsEl.innerHTML = [`<button class="uz-chip uz-chip-all active" onclick="selectUpazila(null,this)">সব</button>`,
    ...upazilas.map(u =>
      `<button class="uz-chip" onclick="selectUpazila('${u}',this)">${u}</button>`)
  ].join("");

  wrap.style.display = "block";
}

function selectUpazila(name, el) {
  selectedUpazila = name;
  document.querySelectorAll(".uz-chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  // selected chip টা দেখা যাবে
  el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}
function onNewDonorDistrictChange() {
  const val  = document.getElementById("new-donor-area").value;
  const wrap = document.getElementById("new-upazila-wrap");
  if (!wrap) return;
  wrap.style.display = val ? "block" : "none";
}

// ==========================================
// SKELETON LOADERS
// ==========================================
function skeletonDonorList() {
  return Array(3).fill(0).map(()=>`
    <div class="sk-card" style="margin:0 16px 10px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <div style="flex:1">
        <div class="skeleton sk-line w80" style="height:16px;margin-bottom:10px;"></div>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <div class="skeleton" style="height:22px;width:50px;border-radius:100px;"></div>
          <div class="skeleton" style="height:22px;width:70px;border-radius:100px;"></div>
        </div>
      </div>
      <div class="skeleton" style="height:38px;width:72px;border-radius:100px;flex-shrink:0;"></div>
    </div>`).join("");
}
function skeletonEmergency() {
  return Array(4).fill(0).map(()=>`<div class="skeleton sk-pill"></div>`).join("");
}
function skeletonCardList(n=3) {
  return `<div class="sk-card">`+Array(n).fill(0).map(()=>`
    <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border);">
      <div class="skeleton sk-line w60" style="height:15px;margin-bottom:8px;"></div>
      <div class="skeleton sk-line w80" style="height:12px;"></div>
    </div>`).join("")+`</div>`;
}

// ==========================================
// EMERGENCY
// ==========================================
const emergencyFallback = [
  {id:"f1", title:"জাতীয় জরুরি",    number:"999",   desc:"পুলিশ, ফায়ার, অ্যাম্বুলেন্স", district:"all", category:"জরুরি"},
  {id:"f2", title:"স্বাস্থ্য বাতায়ন",number:"16263", desc:"স্বাস্থ্য তথ্য (২৪/৭)",       district:"all", category:"স্বাস্থ্য"},
  {id:"f3", title:"নারী সহায়তা",     number:"109",   desc:"টোল-ফ্রি হেল্পলাইন",          district:"all", category:"নারী"},
  {id:"f4", title:"জাতীয় তথ্য",     number:"333",   desc:"সরকারি সেবা ও অভিযোগ",       district:"all", category:"তথ্য"},
  {id:"f5", title:"দুর্যোগ সতর্কতা", number:"1090",  desc:"আবহাওয়া তথ্য",               district:"all", category:"দুর্যোগ"},
  {id:"f6", title:"শিশু হেল্পলাইন",  number:"1098",  desc:"শিশু নির্যাতন প্রতিরোধ",     district:"all", category:"জরুরি"},
  {id:"f7", title:"র‌্যাব হেল্পলাইন",number:"16978", desc:"র‌্যাব জাতীয় হেল্পলাইন",    district:"all", category:"পুলিশ"},
  {id:"f8", title:"দুর্নীতি দমন",    number:"106",   desc:"দুদক হেল্পলাইন",             district:"all", category:"তথ্য"},
];

let _emergencyAll = [];

async function renderEmergency() {
  const sc = document.getElementById("emergency-scroll");
  if (!sc) return;
  sc.innerHTML = skeletonEmergency();
  try {
    const snap = await db.collection("emergency_numbers").orderBy("timestamp","desc").get();
    const fromDB = snap.docs.map(d=>({id:d.id,...d.data()}));
    _emergencyAll = [...emergencyFallback, ...fromDB];
  } catch(e) {
    _emergencyAll = [...emergencyFallback];
  }
  _renderEmCards(_emergencyAll,"all","all");
}

function onEmergencyFilter() {
  const d = document.getElementById("em-filter-district")?.value||"all";
  const c = document.getElementById("em-filter-category")?.value||"all";
  _renderEmCards(_emergencyAll, d, c);
}

function _renderEmCards(all, fd, fc) {
  const sc = document.getElementById("emergency-scroll");
  if (!sc) return;
  const list = all.filter(e => {
    const eD = e.district || e.upazila || "all";
    const mu = fd==="all" || eD==="all" || eD===fd;
    const mc = fc==="all" || (e.category||"")===fc;
    return mu && mc;
  });
  if (!list.length) {
    sc.innerHTML=`<div style="padding:20px;color:var(--text3);font-size:13px;text-align:center">এই ফিল্টারে কোনো নম্বর নেই</div>`;
    return;
  }
  sc.innerHTML = list.map((e,i)=>`
    <a href="tel:${e.number}" class="e-pill" style="animation:fadeUp 0.4s ease ${i*0.06}s both">
      <div class="e-number">${e.number}</div>
      <div class="e-title">${e.title}</div>
      <div class="e-desc">${e.desc}</div>
      ${(e.district&&e.district!=="all")||(e.upazila&&e.upazila!=="all")
        ?`<div class="e-desc" style="color:var(--red);font-weight:700;margin-top:2px">📍 ${bangladeshDistricts[e.district||e.upazila]||e.district||e.upazila}</div>`
        :""}
    </a>`).join("");
}

function openEmergencyAdminModal()   { document.getElementById("emergency-admin-modal").classList.add("open"); }
function closeEmergencyAdminModal(e) {
  if (!e||e.target===document.getElementById("emergency-admin-modal"))
    document.getElementById("emergency-admin-modal").classList.remove("open");
}

function initEmergencyAdminForm() {
  const btn = document.getElementById("submit-emergency-btn");
  if (!btn) return;
  btn.addEventListener("click", async function() {
    const pass     = document.getElementById("em-admin-pass").value.trim();
    const title    = document.getElementById("em-title").value.trim();
    const number   = document.getElementById("em-number").value.trim();
    const desc     = document.getElementById("em-desc").value.trim();
    const district = document.getElementById("em-district").value;
    const category = document.getElementById("em-category").value;
    if (pass!==ADMIN_PASSWORD) { toast("❌ পাসওয়ার্ড ভুল!","red"); return; }
    if (!title||!number)       { toast("নাম ও নম্বর দিন!","red"); return; }
    this.disabled=true; this.textContent="⏳ সেভ হচ্ছে...";
    try {
      await db.collection("emergency_numbers").add({
        title, number, desc, district, category,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      toast("✅ নম্বর যোগ হয়েছে!","green");
      closeEmergencyAdminModal();
      ["em-admin-pass","em-title","em-number","em-desc"].forEach(id=>{
        const el=document.getElementById(id); if(el) el.value="";
      });
      await renderEmergency();
    } catch(e) { toast("সমস্যা হয়েছে!","red"); }
    finally { this.disabled=false; this.textContent="✅ নম্বর যোগ করুন"; }
  });
}

// ==========================================
// HOSPITALS (static + Google Maps)
// ==========================================
function renderHospitals() {
  const govt  = document.getElementById("hospital-govt");
  const priv  = document.getElementById("hospital-private");
  const pharm = document.getElementById("hospital-pharmacy");
  if (!govt) return;
  govt.innerHTML = priv.innerHTML = pharm.innerHTML = skeletonCardList(3);

  const govtData = [
    {name:"DGHS — স্বাস্থ্য অধিদপ্তর", loc:"ঢাকা", map:"https://www.google.com/maps/search/DGHS+Dhaka"},
    {name:"বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়", loc:"শাহবাগ, ঢাকা", map:"https://www.google.com/maps/search/BSMMU+Dhaka"},
    {name:"ঢাকা মেডিকেল কলেজ হাসপাতাল", loc:"ঢাকা", map:"https://www.google.com/maps/search/Dhaka+Medical+College+Hospital"},
    {name:"জাতীয় হৃদরোগ ইনস্টিটিউট (NICVD)", loc:"ঢাকা", map:"https://www.google.com/maps/search/NICVD+Dhaka"},
    {name:"শিশু স্বাস্থ্য ইনস্টিটিউট", loc:"ঢাকা", map:"https://www.google.com/maps/search/Dhaka+Shishu+Hospital"},
    {name:"নিকটস্থ সরকারি হাসপাতাল", loc:"আপনার জেলা", map:"https://www.google.com/maps/search/government+hospital+near+me"},
  ];
  const privData = [
    {name:"Square Hospital", loc:"ঢাকা", map:"https://www.google.com/maps/search/Square+Hospital+Dhaka"},
    {name:"United Hospital", loc:"গুলশান, ঢাকা", map:"https://www.google.com/maps/search/United+Hospital+Dhaka"},
    {name:"Ibn Sina Hospital", loc:"সারাদেশ শাখা", map:"https://www.google.com/maps/search/Ibn+Sina+Hospital+Bangladesh"},
    {name:"Popular Diagnostic Centre", loc:"সারাদেশ", map:"https://www.google.com/maps/search/Popular+Diagnostic+Bangladesh"},
    {name:"Labaid Hospital", loc:"ধানমন্ডি, ঢাকা", map:"https://www.google.com/maps/search/Labaid+Hospital+Dhaka"},
  ];
  const pharmNote = [
    {name:"নিকটস্থ হাসপাতাল", loc:"Google Maps-এ খুঁজুন", map:"https://www.google.com/maps/search/hospital+near+me"},
    {name:"নিকটস্থ ফার্মেসি", loc:"Google Maps-এ খুঁজুন", map:"https://www.google.com/maps/search/pharmacy+near+me"},
    {name:"উপজেলা স্বাস্থ্য কমপ্লেক্স", loc:"প্রতিটি উপজেলায়", map:"https://www.google.com/maps/search/upazila+health+complex"},
  ];

  const buildCard = items => `<div class="card"><div class="info-list">
    ${items.map(i=>`<div class="info-item"><strong>${i.name}</strong><small>${i.loc}</small>
      <br/><a href="${i.map}" target="_blank" class="a-map">🗺️ ম্যাপে দেখুন</a>
    </div>`).join("")}
  </div></div>`;
  setTimeout(()=>{
    govt.innerHTML  = buildCard(govtData);
    priv.innerHTML  = buildCard(privData);
    pharm.innerHTML = buildCard(pharmNote);
  }, 400);
}

// ==========================================
// FOOD
// ==========================================
async function renderFood() {
  const list = document.getElementById("food-list");
  const orgs = document.getElementById("food-orgs");
  if (!list) return;
  list.innerHTML = skeletonCardList(3);

  try {
    const snap = await db.collection("food_posts").orderBy("timestamp","desc").get();
    const posts = snap.docs.map(d=>({id:d.id,...d.data()}));

    list.innerHTML = posts.length ? `
      <div style="padding:4px 20px 8px;font-size:12px;font-weight:600;color:var(--text3);">
        <span class="live-dot"></span>
        <span class="live-label">${posts.length}টি সক্রিয় পোস্ট</span>
      </div>
      ${posts.map((f,i)=>`
        <div class="donor-card" style="animation-delay:${i*0.06}s;flex-direction:column;align-items:flex-start;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%">
            <h4 style="margin:0 0 4px">🍽️ ${f.name}</h4>
            <button onclick="openDeleteFoodModal('${f.id}')"
              style="background:none;border:1px solid var(--border);border-radius:8px;padding:4px 10px;font-size:12px;color:var(--text3);cursor:pointer;">
              🗑️ মুছুন
            </button>
          </div>
          <div style="font-size:13px;color:var(--text2);line-height:1.5">${f.desc}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;font-size:12px;">
            <span class="dtag blood">🎁 ${f.offer}</span>
            ${f.time    ?`<span class="dtag area">🕒 ${f.time}</span>`:""}
            ${f.maplink ?`<a href="${f.maplink}" target="_blank" class="dtag type" style="text-decoration:none">📍 ম্যাপ</a>`:""}
          </div>
          <div style="font-size:11px;color:var(--text4)">🕐 ${f.timestamp?.toDate?.().toLocaleString("bn-BD")||""}</div>
        </div>`).join("")}
      <button class="btn-submit green" onclick="openFoodModal()" style="margin:8px 16px;width:calc(100% - 32px)">
        🍱 নতুন খাবারের তথ্য পোস্ট করুন
      </button>` : `
      <div style="text-align:center;padding:32px 16px;">
        <div style="font-size:40px;margin-bottom:8px">🍽️</div>
        <p style="color:var(--text3);font-size:14px;margin-bottom:16px">এখন কোনো খাবারের পোস্ট নেই</p>
        <button class="btn-submit green" onclick="openFoodModal()" style="max-width:240px;margin:0 auto">
          🍱 খাবারের তথ্য পোস্ট করুন
        </button>
      </div>`;
  } catch(e) {
    list.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text3);">ডাটা লোড হচ্ছে না।</div>`;
  }

  if (orgs) orgs.innerHTML=`<div class="card"><div class="info-list">
    <div class="info-item"><strong>বিদ্যানন্দ ফাউন্ডেশন</strong><small>সারাদেশে বিনামূল্যে খাবার বিতরণ</small></div>
    <div class="info-item"><strong>আস-সুন্নাহ ফাউন্ডেশন</strong><small>মানবিক সহায়তা ও খাদ্য বিতরণ</small></div>
    <div class="info-item"><strong>বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি</strong><small>দুর্যোগ ও মানবিক সহায়তা</small></div>
    <div class="info-item"><strong>BRAC — খাদ্য নিরাপত্তা কার্যক্রম</strong><small>দেশব্যাপী স্বেচ্ছাসেবী নেটওয়ার্ক</small></div>
  </div></div>`;
}

function openFoodModal()  { document.getElementById("food-modal").classList.add("open"); }
function closeFoodModal(e) {
  if (!e||e.target===document.getElementById("food-modal"))
    document.getElementById("food-modal").classList.remove("open");
}

let _deleteFoodId = null;
function openDeleteFoodModal(id) {
  _deleteFoodId = id;
  document.getElementById("food-delete-modal").classList.add("open");
}
function closeDeleteFoodModal(e) {
  if (!e||e.target===document.getElementById("food-delete-modal"))
    document.getElementById("food-delete-modal").classList.remove("open");
}

function initFoodForm() {
  const addBtn = document.getElementById("submit-food-btn");
  if (addBtn) {
    addBtn.addEventListener("click", async function() {
      const name    = document.getElementById("food-name").value.trim();
      const desc    = document.getElementById("food-desc").value.trim();
      const offer   = document.getElementById("food-offer").value;
      const time    = document.getElementById("food-time-input").value.trim();
      const maplink = document.getElementById("food-map").value.trim();
      const pin     = document.getElementById("food-pin").value.trim();
      if (!name||!desc)               { toast("নাম ও বিবরণ দিন!","red"); return; }
      if (!pin||!/^\d{4}$/.test(pin)) { toast("৪ সংখ্যার PIN দিন!","red"); return; }
      this.disabled=true;
      const btnText=document.getElementById("food-btn-text");
      if (btnText) btnText.textContent="⏳ পোস্ট হচ্ছে...";
      try {
        await db.collection("food_posts").add({
          name, desc, offer, time, maplink, pin,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        toast("✅ পোস্ট হয়েছে!","green");
        closeFoodModal();
        ["food-name","food-desc","food-time-input","food-map","food-pin"]
          .forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
        setTimeout(()=>renderFood(),800);
      } catch(e) { toast("সমস্যা হয়েছে!","red"); }
      finally { this.disabled=false; if(btnText) btnText.textContent="🍱 পোস্ট করুন"; }
    });
  }

  const delBtn = document.getElementById("confirm-delete-food-btn");
  if (delBtn) {
    delBtn.addEventListener("click", async function() {
      const pin = document.getElementById("food-delete-pin").value.trim();
      if (!pin) { toast("PIN দিন!","red"); return; }
      this.disabled=true;
      try {
        const doc = await db.collection("food_posts").doc(_deleteFoodId).get();
        if (!doc.exists) { toast("পোস্ট পাওয়া যায়নি!","red"); return; }
        if (doc.data().pin !== pin) { toast("❌ PIN ভুল!","red"); return; }
        await db.collection("food_posts").doc(_deleteFoodId).delete();
        toast("✅ পোস্ট মুছে গেছে!","green");
        closeDeleteFoodModal();
        document.getElementById("food-delete-pin").value="";
        renderFood();
      } catch(e) { toast("সমস্যা হয়েছে!","red"); }
      finally { this.disabled=false; }
    });
  }
}

// ==========================================
// JOBS
// ==========================================
async function renderJobs() {
  const jobsList   = document.getElementById("jobs-list");
  const skillsList = document.getElementById("skills-list");
  if (!jobsList) return;
  jobsList.innerHTML = skeletonCardList(3);

  try {
    const snap = await db.collection("jobs").orderBy("timestamp","desc").get();
    const jobs = snap.docs.map(d=>({id:d.id,...d.data()}));
    const typeClass = {"Full-Time":"ft","Part-Time":"pt","Intern":"in"};

    jobsList.innerHTML=`<div class="card">
      ${jobs.length ? jobs.map(j=>`
        <div class="job-item">
          <div class="job-top">
            <strong>🏢 ${j.org||""}</strong>
            <span class="jbadge ${typeClass[j.type]||"ft"}">${j.type||"Full-Time"}</span>
          </div>
          <div class="job-detail">📌 ${j.role||""}</div>
          <div class="job-seats">🪑 খালি পদ: ${j.seats||""} টি</div>
        </div>`).join("")
      : `<div style="text-align:center;padding:20px;color:var(--text3);">এখন কোনো চাকরির পোস্ট নেই</div>`}
      <button class="btn-submit green" onclick="openJobModal()" style="margin-top:8px">📢 নতুন চাকরি পোস্ট করুন</button>
    </div>`;
  } catch(e) {
    jobsList.innerHTML=`<div class="card"><div style="text-align:center;padding:20px;color:var(--text3);">ডাটা লোড হচ্ছে না।</div></div>`;
  }

  if (skillsList) skillsList.innerHTML=`<div class="card"><div class="info-list">
    <div class="info-item"><strong>BRAC Skills Development</strong><small>সারাদেশে — কম্পিউটার, সেলাই, উদ্যোক্তা উন্নয়ন</small></div>
    <div class="info-item"><strong>টেকনিক্যাল ট্রেনিং সেন্টার (TTC)</strong><small>৬৪ জেলায় — ইলেকট্রিক্যাল, ওয়েল্ডিং</small></div>
    <div class="info-item"><strong>জেলা যুব উন্নয়ন অধিদপ্তর</strong><small>সারাদেশ — কম্পিউটার, ড্রাইভিং, সেলাই</small></div>
    <div class="info-item"><strong>পলিটেকনিক ইন্সটিটিউট</strong><small>৪৯টি সরকারি পলিটেকনিক — ডিপ্লোমা</small></div>
  </div></div>`;
}

function openJobModal()          { document.getElementById("job-modal").classList.add("open"); }
function closeJobModalOutside(e) {
  if (e.target===document.getElementById("job-modal"))
    document.getElementById("job-modal").classList.remove("open");
}

function initJobForm() {
  document.getElementById("submit-job-btn").addEventListener("click", async function() {
    const org   = document.getElementById("job-org").value.trim();
    const role  = document.getElementById("job-role").value.trim();
    const type  = document.getElementById("job-type").value;
    const seats = document.getElementById("job-seats").value.trim();
    if (!org||!role||!seats) { toast("সব তথ্য দিন!","red"); return; }
    this.disabled=true;
    const btnText=document.getElementById("job-btn-text");
    if (btnText) btnText.textContent="⏳ পোস্ট হচ্ছে...";
    try {
      await db.collection("jobs").add({
        org, role, type, seats,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      toast("✅ চাকরির খবর যোগ হয়েছে!","green");
      closeJobModalOutside({target:document.getElementById("job-modal")});
      ["job-org","job-role","job-seats"].forEach(id=>document.getElementById(id).value="");
      setTimeout(()=>renderJobs(),800);
    } catch(e) { toast("সমস্যা হয়েছে!","red"); }
    finally { this.disabled=false; if(btnText) btnText.textContent="📢 চাকরি পোস্ট করুন"; }
  });
}

// ==========================================
// BLOOD SEARCH
// ==========================================
async function searchBlood() {
  const group       = document.getElementById("blood-group").value;
  const districtKey = document.getElementById("blood-area").value;
  const upazilaText = selectedUpazila ? selectedUpazila.toLowerCase() : "";
  const res         = document.getElementById("blood-results");
  res.innerHTML = skeletonDonorList();

  try {
    let query = db.collection("blood_donors");
    if (group) query = query.where("group","==",group);
    if (districtKey) query = query.where("district","==",districtKey);
    const snap = await query.get();
    let donors = snap.docs.map(d=>({id:d.id,...d.data()}));

    // upazila text filter (client-side)
    if (upazilaText) {
      donors = donors.filter(d =>
        (d.upazila||"").toLowerCase().includes(upazilaText)
      );
    }

    await new Promise(r=>setTimeout(r,300));
    res.innerHTML="";

    if (!donors.length) {
      res.innerHTML=`<div class="no-result"><div class="nri">😔</div><p>কোনো ডোনার পাওয়া যায়নি।<br/><small>ভিন্ন গ্রুপ বা জেলা দিয়ে চেষ্টা করুন।</small></p></div>`;
      return;
    }

    res.innerHTML=`<div style="padding:4px 20px 8px;font-size:12px;font-weight:600;color:var(--text3);">
      <span class="live-dot"></span>
      <span class="live-label">${donors.length} জন ডোনার পাওয়া গেছে</span>
    </div>`;

    donors.forEach((d,i)=>{
      const clean    = (d.phone||"").replace(/\D/g,"");
      const hasPhone = clean.length>=6;
      const el       = document.createElement("div");
      el.className   = "donor-card";
      el.style.animationDelay=`${i*0.06}s`;
      const distLabel = bangladeshDistricts[d.district]||d.district||"";
      el.innerHTML=`
        <div class="donor-left">
          <h4>${d.name}</h4>
          <div class="donor-tags">
            <span class="dtag blood">🩸 ${d.group}</span>
            ${distLabel ?`<span class="dtag area">📍 ${distLabel}</span>`:""}
            ${d.upazila?`<span class="dtag type">🏘️ ${d.upazila}</span>`:""}
          </div>
          ${hasPhone?`<div class="donor-masked">📞 ${maskPhone(d.phone)}</div>`:""}
        </div>
        ${hasPhone?`<a href="tel:${clean}" class="call-btn-pill">📞 কল</a>`
                  :`<span style="font-size:12px;color:var(--text4)">সরাসরি আসুন</span>`}`;
      res.appendChild(el);
    });
  } catch(e) {
    res.innerHTML=`<div class="no-result"><div class="nri">⚠️</div><p>ডাটা লোড হয়নি।<br/><small>${e.message}</small></p></div>`;
  }
}

// ── Donor Modal ──
function openModal()          { document.getElementById("donor-modal").classList.add("open"); }
function closeModalOutside(e) {
  if (e.target===document.getElementById("donor-modal"))
    document.getElementById("donor-modal").classList.remove("open");
}

function initDonorForm() {
  document.getElementById("submit-donor-btn").addEventListener("click", async function() {
    const name    = document.getElementById("donor-name").value.trim();
    const group   = document.getElementById("new-donor-group").value;
    const district= document.getElementById("new-donor-area").value;
    const upazila = (document.getElementById("new-donor-upazila")?.value||"").trim();
    const phone   = document.getElementById("donor-phone").value.trim();
    if (!name||!group||!district||!phone) { toast("সব তথ্য দিন!","red"); return; }
    if (!/^01[0-9]{9}$/.test(phone))      { toast("সঠিক মোবাইল নম্বর দিন!","red"); return; }
    this.disabled=true;
    document.getElementById("donor-btn-text").textContent="⏳ সেভ হচ্ছে...";
    try {
      await db.collection("blood_donors").add({
        name, group, district, upazila, phone,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      toast("✅ ডোনার হিসেবে যুক্ত হয়েছেন!","green");
      closeModalOutside({target:document.getElementById("donor-modal")});
      ["donor-name","donor-phone"].forEach(id=>document.getElementById(id).value="");
      document.getElementById("new-donor-group").value="";
      document.getElementById("new-donor-area").value="";
      const nu=document.getElementById("new-donor-upazila");
      const nw=document.getElementById("new-upazila-wrap");
      if(nu) nu.value=""; if(nw) nw.style.display="none";
    } catch(e) { toast("সমস্যা হয়েছে!","red"); }
    finally { this.disabled=false; document.getElementById("donor-btn-text").textContent="❤️ ডোনার লিস্টে যুক্ত করুন"; }
  });
}

// ==========================================
// MEDICINE FINDER
// ==========================================
const medicineDB = {
  napa:   {name:"Napa / Paracetamol (জ্বর)",map:"https://www.google.com/maps/search/pharmacy+near+me"},
  seclo:  {name:"Seclo 20mg (গ্যাস্ট্রিক)", map:"https://www.google.com/maps/search/pharmacy+near+me"},
  alatrol:{name:"Alatrol (অ্যালার্জি)",      map:"https://www.google.com/maps/search/pharmacy+near+me"},
  monas:  {name:"Monas 10 (হাঁপানি)",        map:"https://www.google.com/maps/search/pharmacy+near+me"},
  flagyl: {name:"Flagyl 400mg (পেট খারাপ)", map:"https://www.google.com/maps/search/pharmacy+near+me"},
};
function findMed() {
  const id=document.getElementById("medicine-select").value;
  const div=document.getElementById("med-result");
  if (!id) { div.classList.remove("show"); return; }
  const m=medicineDB[id];
  div.innerHTML=`✅ <strong>${m.name}</strong><br/><small>নিকটস্থ যেকোনো ফার্মেসিতে পাওয়া যাবে</small> <a href="${m.map}" target="_blank" class="a-map" style="margin-top:6px">🗺️ ম্যাপে খুঁজুন</a>`;
  div.classList.add("show");
}

// ==========================================
// PHARMACIES
// ==========================================
function openPharmacyModal()  { document.getElementById("pharmacy-modal").classList.add("open"); }
function closePharmacyModalOutside(e) {
  if (e.target===document.getElementById("pharmacy-modal"))
    document.getElementById("pharmacy-modal").classList.remove("open");
}

async function renderPharmacies() {
  const container=document.getElementById("pharmacy-list-container");
  if (!container) return;
  container.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text3);">🏪 ফার্মেসি লোড হচ্ছে...</div>`;
  try {
    const snap=await db.collection("pharmacies").orderBy("timestamp","desc").get();
    if (snap.empty) {
      container.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text3);">🛑 এখনো কোনো ফার্মেসি যুক্ত হয়নি।</div>`;
      return;
    }
    let html="";
    snap.docs.forEach(doc=>{
      const ph={id:doc.id,...doc.data()};
      const waNumber=(ph.whatsapp||"").startsWith("88")?ph.whatsapp:"88"+(ph.whatsapp||"");
      const waMsg=encodeURIComponent("আসসালামু আলাইকুম, আমি LifeLine অ্যাপ থেকে যোগাযোগ করছি। আপনাদের কাছে কি এই ঔষধটি আছে?");
      html+=`
        <div class="card" style="border-radius:16px;padding:16px;margin-bottom:12px;border:1px solid var(--border);">
          <h3 style="font-size:16px;font-weight:700;margin:0 0 4px;">🏪 ${ph.name}</h3>
          <p style="font-size:12px;color:var(--text3);margin:0 0 8px;">📍 ${ph.area}</p>
          ${ph.details?`<p style="font-size:12px;color:var(--text2);background:var(--bg);padding:6px 10px;border-radius:8px;margin:0 0 12px;">📝 ${ph.details}</p>`:""}
          <div style="display:flex;gap:8px;margin-top:8px;">
            ${ph.phone   ?`<a href="tel:${ph.phone}" style="flex:1;text-align:center;background:var(--blue-soft);color:var(--blue);padding:8px;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;">📞 কল</a>`:""}
            ${ph.whatsapp?`<a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" style="flex:1;text-align:center;background:#E3F7EA;color:#25D366;padding:8px;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;">💬 WhatsApp</a>`:""}
            ${ph.map&&ph.map!=="#"?`<a href="${ph.map}" target="_blank" style="flex:1;text-align:center;background:var(--orange-soft);color:var(--orange);padding:8px;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;">📍 ম্যাপ</a>`:""}
          </div>
        </div>`;
    });
    container.innerHTML=html;
  } catch(e) {
    container.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text3);">🛑 লোড হয়নি।</div>`;
  }
}

function initPharmacyForm() {
  const btn=document.getElementById("submit-pharmacy-btn");
  if (!btn) return;
  btn.addEventListener("click", async function() {
    const name    =document.getElementById("ph-name").value.trim();
    const phone   =document.getElementById("ph-phone").value.trim();
    const whatsapp=document.getElementById("ph-whatsapp").value.trim();
    const area    =document.getElementById("ph-area").value.trim();
    const map     =document.getElementById("ph-map").value.trim();
    const details =document.getElementById("ph-details").value.trim();
    if (!name||!phone||!whatsapp||!area||!map) { toast("⚠️ সব বাধ্যতামূলক তথ্য দিন!","red"); return; }
    if (!/^01[0-9]{9}$/.test(phone)||!/^01[0-9]{9}$/.test(whatsapp)) { toast("❌ সঠিক ১১ ডিজিটের নম্বর দিন!","red"); return; }
    this.disabled=true;
    document.getElementById("ph-btn-text").textContent="⏳ প্রোফাইল তৈরি হচ্ছে...";
    try {
      await db.collection("pharmacies").add({
        name, phone, whatsapp, area, map, details,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      toast("✅ ফার্মেসি প্রোফাইল লাইভ হয়েছে!","green");
      document.getElementById("pharmacy-modal").classList.remove("open");
      ["ph-name","ph-phone","ph-whatsapp","ph-area","ph-map","ph-details"].forEach(id=>{document.getElementById(id).value="";});
      setTimeout(()=>renderPharmacies(),800);
    } catch(e) { toast("❌ সমস্যা হয়েছে!","red"); }
    finally { this.disabled=false; document.getElementById("ph-btn-text").textContent="🚀 প্রোফাইল লাইভ করুন"; }
  });
}

// ==========================================
// OFFLINE / PWA
// ==========================================
function checkOnline() {
  document.getElementById("offline-notice").classList.toggle("hidden",navigator.onLine);
}
window.addEventListener("online",checkOnline);
window.addEventListener("offline",checkOnline);
checkOnline();

if ("serviceWorker" in navigator) {
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

let deferredPrompt = null;
const installModal   = document.getElementById("install-modal");
const installOverlay = document.getElementById("install-overlay");

function showInstallModal() {
  installModal.classList.remove("hidden");
  installOverlay.classList.remove("hidden");
}
function hideInstallModal() {
  installModal.classList.add("hidden");
  installOverlay.classList.add("hidden");
}

// ৭ দিন আগে dismiss করলে আর দেখাবে না
const _dismissed = localStorage.getItem("installDismissed");
if (_dismissed && Date.now() - Number(_dismissed) > 7 * 24 * 60 * 60 * 1000) {
  localStorage.removeItem("installDismissed");
}

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem("installDismissed")) {
    setTimeout(showInstallModal, 3000);
  }
});

document.getElementById("install-btn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  hideInstallModal();
  if (outcome === "accepted") toast("✅ ইন্সটল হচ্ছে!", "green");
});

document.getElementById("install-close").addEventListener("click", () => {
  hideInstallModal();
  localStorage.setItem("installDismissed", Date.now());
});

installOverlay.addEventListener("click", () => {
  hideInstallModal();
  localStorage.setItem("installDismissed", Date.now());
});

// ==========================================
// SOS SYSTEM — নারী সুরক্ষা
// ==========================================
let sosHoldTimer = null;
let sosCountTimer = null;
let sosCountdown  = 3;
let sosIsHolding  = false;

// Trusted contact
function sosLoadContact() {
  const c = JSON.parse(localStorage.getItem("sosTrustedContact") || "null");
  if (c) {
    document.getElementById("sos-saved-name").textContent = c.name;
    document.getElementById("sos-saved-num").textContent  = c.phone;
    document.getElementById("sos-saved-view").classList.remove("hidden");
    document.getElementById("sos-form-view").classList.add("hidden");
  } else {
    document.getElementById("sos-saved-view").classList.add("hidden");
    document.getElementById("sos-form-view").classList.remove("hidden");
  }
}

function sosSaveContact() {
  const name  = document.getElementById("sos-contact-name-input").value.trim();
  const phone = document.getElementById("sos-contact-phone-input").value.trim();
  if (!name)  { toast("নাম লিখুন!", "red"); return; }
  if (!phone || !/^01[0-9]{9}$/.test(phone)) { toast("সঠিক মোবাইল নম্বর দিন!", "red"); return; }
  localStorage.setItem("sosTrustedContact", JSON.stringify({ name, phone }));
  toast("✅ সেভ হয়েছে!", "green");
  sosLoadContact();
}

function sosEditContact() {
  const c = JSON.parse(localStorage.getItem("sosTrustedContact") || "null");
  if (c) {
    document.getElementById("sos-contact-name-input").value  = c.name;
    document.getElementById("sos-contact-phone-input").value = c.phone;
  }
  document.getElementById("sos-saved-view").classList.add("hidden");
  document.getElementById("sos-form-view").classList.remove("hidden");
}

// 3-second hold logic
function sosHoldStart(e) {
  e.preventDefault();
  if (sosIsHolding) return;
  sosIsHolding = true;

  const wrap = document.getElementById("sos-btn-wrap");
  const sub  = document.getElementById("sos-btn-sub");
  const hint = document.getElementById("sos-cancel-hint");

  if (wrap) wrap.classList.add("holding");
  if (hint) hint.style.opacity = "1";
  if (sub)  sub.textContent = "৩...";

  if (navigator.vibrate) navigator.vibrate(80);

  sosCountdown  = 3;
  sosCountTimer = setInterval(() => {
    sosCountdown--;
    if (sosCountdown > 0) {
      if (sub) sub.textContent = sosCountdown + "...";
      if (navigator.vibrate) navigator.vibrate(60);
    }
  }, 1000);

  sosHoldTimer = setTimeout(() => {
    sosHoldCleanup();
    sosTriggered();
  }, 3000);
}

function sosHoldEnd(e) {
  if (!sosIsHolding) return;
  sosHoldCleanup();
}

function sosHoldCleanup() {
  clearTimeout(sosHoldTimer);
  clearInterval(sosCountTimer);
  sosHoldTimer  = null;
  sosCountTimer = null;
  sosIsHolding  = false;

  const wrap = document.getElementById("sos-btn-wrap");
  const hint = document.getElementById("sos-cancel-hint");
  const sub  = document.getElementById("sos-btn-sub");
  if (wrap) wrap.classList.remove("holding");
  if (hint) hint.style.opacity = "0";
  if (sub)  sub.textContent = "চেপে ধরুন";
}

// Trigger SOS
function sosTriggered() {
  // Vibrate
  if (navigator.vibrate) navigator.vibrate([500,200,500,200,500,200,1000]);

  // Screen flash
  const flash = document.getElementById("sos-flash");
  flash.classList.add("active");
  setTimeout(() => flash.classList.remove("active"), 700);

  // Show modal immediately
  document.getElementById("sos-modal-overlay").classList.remove("hidden");
  document.getElementById("sos-triggered-modal").classList.remove("hidden");
  document.getElementById("sos-location-status").textContent = "অবস্থান নির্ধারণ হচ্ছে...";
  document.getElementById("sos-sms-link").href = "#";
  document.getElementById("sos-wa-link").href  = "#";

  // Get GPS location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat  = pos.coords.latitude;
        const lng  = pos.coords.longitude;
        const maps = `https://maps.google.com/?q=${lat},${lng}`;
        sosSetLinks(maps);
        document.getElementById("sos-location-status").textContent = "✅ অবস্থান পাওয়া গেছে";
      },
      () => {
        sosSetLinks(null);
        document.getElementById("sos-location-status").textContent = "⚠️ অবস্থান পাওয়া যায়নি";
      },
      { timeout: 6000, maximumAge: 30000 }
    );
  } else {
    sosSetLinks(null);
    document.getElementById("sos-location-status").textContent = "⚠️ GPS সমর্থিত নয়";
  }
}

function sosSetLinks(mapsUrl) {
  const c = JSON.parse(localStorage.getItem("sosTrustedContact") || "null");
  if (!c) return;

  const locText = mapsUrl
    ? `আমার location: ${mapsUrl}`
    : "আমার location জানা যায়নি";
  const msg = encodeURIComponent(`🆘 আমি বিপদে আছি! ${locText} — LifeLine Bangladesh`);
  const phone = c.phone.replace(/^0/, "880");

  document.getElementById("sos-sms-link").href = `sms:${c.phone}?body=${msg}`;
  document.getElementById("sos-wa-link").href  = `https://wa.me/${phone}?text=${msg}`;
}

function closeSosModal() {
  document.getElementById("sos-modal-overlay").classList.add("hidden");
  document.getElementById("sos-triggered-modal").classList.add("hidden");
  document.getElementById("sos-btn-sub").textContent = "চেপে ধরুন";
}

// Init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  sosLoadContact();

  // SOS button — touchstart + mousedown for max compatibility
  const sosBtn = document.getElementById("sos-btn");
  if (sosBtn) {
    sosBtn.addEventListener("touchstart",  sosHoldStart, { passive: false });
    sosBtn.addEventListener("touchend",    sosHoldEnd);
    sosBtn.addEventListener("touchcancel", sosHoldEnd);
    sosBtn.addEventListener("mousedown",   sosHoldStart);
    sosBtn.addEventListener("mouseup",     sosHoldEnd);
    sosBtn.addEventListener("mouseleave",  sosHoldEnd);
  }
});
