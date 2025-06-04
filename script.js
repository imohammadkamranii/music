const img = document.querySelector("#img");
const playPause = document.querySelector("#playpause");
const playPauseBtn = document.querySelector("#playpause-btn");
const audio = document.querySelector("#audio");
const title = document.querySelector("#title");
const prevBtn = document.querySelector("#prevbtn");
const nextBtn = document.querySelector("#nextbtn");
const progress = document.querySelector("#progress");
const progressBar = document.querySelector(".progress-bar");
const currTime = document.querySelector(".current-time");
const totalDuration = document.querySelector(".duration-time");
const volume = document.querySelector("#volume");
const layer = document.querySelector(".layer");
const volBar = document.querySelector(".bar");
const progressLine = document.querySelector(".progress-line");
const volumeRange = document.querySelector(".volumerange");
const repeatBtn = document.querySelector("#repeat");
const likeBtn = document.querySelector("#like");
const likeIcon = document.querySelector("#likeicon");
const songListBtn = document.querySelector("#list");
const songList = document.querySelector("#songs-list");
const listCloseBtn = document.querySelector("#listclose");

// آرایه پیش‌فرض برای مواقع خطا
const fallbackSongs = [
    {
        path: 'https://raw.githubusercontent.com/ustabasiibrahim/music-player/master/assets/music/1.mp3',
        displayName: 'Yıldız Tozu',
        artist: 'Ozbi',
        cover: "https://images.genius.com/ee202c6f724ffd4cf61bd01a205eeb47.1000x1000x1.jpg"
    }
];

// متغیر برای ذخیره آهنگ‌ها
let songs = [];
let songIndex = 0; // آهنگ پیش‌فرض
let isPlaying = false;

// تابع برای بارگذاری آهنگ‌ها از songs.json
async function loadSongs() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/USERNAME/REPO/main/songs.json'); // مسیر فایل JSON در GitHub
        if (!response.ok) throw new Error(`خطا در بارگذاری songs.json: ${response.status}`);
        songs = await response.json();
        if (!Array.isArray(songs) || songs.some(song => !song.path || !song.displayName || !song.cover)) {
            throw new Error('فرمت داده‌های آهنگ نامعتبر است');
        }
        if (songs.length === 0) {
            songs = fallbackSongs;
        }
        // بارگذاری آهنگ اولیه
        loadSong(songs[songIndex]);
        // پر کردن لیست آهنگ‌ها (اگر songList وجود دارد)
        populateSongList();
    } catch (error) {
        console.error('خطا در بارگذاری آهنگ‌ها:', error);
        songs = fallbackSongs; // استفاده از آرایه پیش‌فرض
        loadSong(songs[songIndex]);
        populateSongList();
        // نمایش پیام خطا به کاربر (اختیاری)
        songList.innerHTML = `<li class="error-message">خطا در بارگذاری آهنگ‌ها: ${error.message}</li>`;
    }
}

// تابع برای پر کردن لیست آهنگ‌ها
function populateSongList() {
    songList.innerHTML = ''; // پاک کردن لیست فعلی
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'song-item';
        li.innerHTML = `<div class="song-number">${index + 1}</div><div class="song-title">${song.displayName} - ${song.artist}</div>`;
        li.addEventListener('click', () => {
            songIndex = index;
            loadSong(songs[songIndex]);
            playSong();
            songList.classList.remove('showlist'); // بستن لیست پس از انتخاب
        });
        songList.appendChild(li);
    });
}

// تابع برای پخش آهنگ
function playSong() {
    isPlaying = true;
    playPauseBtn.classList.replace("fa-play", "fa-pause");
    audio.play().catch(err => {
        console.error('خطا در پخش:', err);
        songList.innerHTML = `<li class="error-message">خطا در پخش آهنگ "${songs[songIndex].displayName}": ${err.message}</li>`;
    });
}

// تابع برای توقف آهنگ
function pauseSong() {
    isPlaying = false;
    playPauseBtn.classList.replace("fa-pause", "fa-play");
    audio.pause();
}

// تابع برای بارگذاری آهنگ
function loadSong(song) {
    img.src = song.cover;
    title.textContent = `${song.displayName} - ${song.artist}`;
    audio.src = song.path;
}

// تابع برای آهنگ قبلی
function prevSong() {
    songIndex--;
    if (songIndex < 0) {
        songIndex = songs.length - 1;
    }
    loadSong(songs[songIndex]);
    playSong();
}

// تابع برای آهنگ بعدی
function nextSong() {
    songIndex++;
    if (songIndex > songs.length - 1) {
        songIndex = 0;
    }
    loadSong(songs[songIndex]);
    playSong();
}

// تابع برای به‌روزرسانی نوار پیشرفت
function updateProgress(e) {
    if (isPlaying) {
        const { duration, currentTime } = e.target;
        const progressPercent = (currentTime / duration) * 100;
        progress.value = progressPercent;
        progressLine.style.width = `${progressPercent}%`;
        if (progressPercent === 100) {
            return nextSong();
        }
        const durationMinutes = Math.floor(duration / 60);
        let durationSeconds = Math.floor(duration % 60);
        if (durationSeconds < 10) {
            durationSeconds = `0${durationSeconds}`;
        }
        if (durationSeconds) {
            totalDuration.textContent = `${durationMinutes}:${durationSeconds}`;
        }
        let currentMinutes = Math.floor(currentTime / 60);
        let currentSeconds = Math.floor(currentTime % 60);
        if (currentSeconds < 10) {
            currentSeconds = `0${currentSeconds}`;
        }
        currTime.textContent = `${currentMinutes}:${currentSeconds}`;
    }
}

// تابع برای جابجایی در نوار پیشرفت
function progressSlide(e) {
    const { value } = e.target;
    const progressTime = Math.ceil((audio.duration / 100) * value);
    audio.currentTime = progressTime;
    if (!isPlaying) {
        progressLine.style.width = `${value}%`;
    }
}

// تابع برای کنترل ولوم
function volumeBar() {
    layer.classList.toggle('hide');
    setTimeout(() => {
        if (layer.classList.contains("hide")) {
            layer.classList.remove("hide");
        }
    }, 5000);
}

// تابع برای تنظیم ولوم
function setVolume() {
    audio.volume = volumeRange.value;
    const barWidth = (volumeRange.value / 1) * 100;
    volBar.style.width = `${barWidth}%`;
}

// تابع برای تکرار آهنگ
function repeat() {
    repeatBtn.classList.toggle('color');
    audio.loop = repeatBtn.classList.contains("color");
}

// تابع برای لایک کردن
function like() {
    if (likeBtn.classList.toggle('color')) {
        likeIcon.classList.replace('far', 'fas');
    } else {
        likeIcon.classList.replace('fas', 'far');
    }
}

// تابع برای نمایش/مخفی کردن لیست آهنگ‌ها
function musicList() {
    songList.classList.toggle("showlist");
    listCloseBtn.addEventListener("click", () => {
        songList.classList.remove("showlist");
    });
}

// رویدادها
playPause.addEventListener("click", () => (isPlaying ? pauseSong() : playSong()));
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
audio.addEventListener("timeupdate", updateProgress);
progress.addEventListener("input", progressSlide);
volume.addEventListener("click", volumeBar);
volumeRange.addEventListener("input", setVolume);
repeatBtn.addEventListener("click", repeat);
likeBtn.addEventListener("click", like);
songListBtn.addEventListener("click", musicList);

// بارگذاری اولیه آهنگ‌ها
loadSongs();
