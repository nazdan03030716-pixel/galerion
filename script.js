// ===============================
// ХРАНЕНИЕ И ЗАГРУЗКА ДАННЫХ
// ===============================

function getImages() {
    return JSON.parse(localStorage.getItem("images")) || [];
}

function saveImages(images) {
    localStorage.setItem("images", JSON.stringify(images));
}

// ===============================
// ОСНОВНАЯ ФУНКЦИЯ ДОБАВЛЕНИЯ
// ===============================

function handleFile(file, genre = "other") {
    if (!file) return;

    const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!validTypes.includes(file.type)) {
        alert("Этот формат не поддерживается.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const images = getImages();

        images.push({
            image: event.target.result,
            genre: genre
        });

        saveImages(images);
        renderGallery();
    };

    reader.readAsDataURL(file);
}

// ===============================
// КНОПКА ЗАГРУЗКИ
// ===============================

function addImage() {
    const input = document.getElementById("uploadInput");
    const genre = document.getElementById("genreSelect").value;

    const file = input.files[0];
    handleFile(file, genre);
}

// ===============================
// ОТОБРАЖЕНИЕ ГАЛЕРЕИ
// ===============================

function renderGallery(filter = "all") {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    const images = getImages();

    images.forEach((img, index) => {

        if (filter !== "all" && img.genre !== filter) return;

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${img.image}">
            <p>${img.genre}</p>
            <button onclick="deleteImage(${index})">Удалить</button>
        `;

        gallery.appendChild(card);
    });
}

// ===============================
// УДАЛЕНИЕ
// ===============================

function deleteImage(index) {
    const images = getImages();

    images.splice(index, 1);

    saveImages(images);
    renderGallery();
}

// ===============================
// DRAG & DROP
// ===============================

const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
        handleFile(file, "other");
    }
});

// ===============================
// ФИЛЬТР (если есть кнопки)
// ===============================

function filterGallery(genre) {
    renderGallery(genre);
}

// ===============================
// ПЕРВЫЙ ЗАПУСК
// ===============================

renderGallery();