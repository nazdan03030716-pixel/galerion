// ===============================
// SUPABASE ПОДКЛЮЧЕНИЕ
// ===============================

const supabaseUrl = "https://aoaafscgnmtnszopfzaj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvYWFmc2Nnbm10bnN6b3BmemFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDA2MjUsImV4cCI6MjA5Mjc3NjYyNX0.YeWJLDn7sSnlI5lqgrbP6HynMF2qi4Cq-hiPACaDXfk";

// создаём клиент нормально, без магии и саморазрушения
const client = supabase.createClient(supabaseUrl, supabaseKey);


// ===============================
// ДОБАВЛЕНИЕ ИЗОБРАЖЕНИЯ
// ===============================

async function handleFile(file, genre = "other") {
    if (!file) {
        alert("Выберите файл.");
        return;
    }

    const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/jpg"
    ];

    if (!validTypes.includes(file.type)) {
        alert("Этот формат не поддерживается.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (event) {
        const base64Image = event.target.result;

        const { error } = await client
            .from("image")
            .insert([
                {
                    image: base64Image,
                    genre: genre,
                    title: file.name
                }
            ]);

        if (error) {
            console.error("Ошибка загрузки:", error);
            alert("Не удалось загрузить изображение.");
            return;
        }

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

    input.value = "";
}


// ===============================
// ЗАГРУЗКА ГАЛЕРЕИ
// ===============================

async function renderGallery() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    const { data, error } = await client
        .from("image")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Ошибка загрузки галереи:", error);
        return;
    }

    const filterMode = document.getElementById("filterMode").value;
    const genreFilter = document.getElementById("genreFilter").value;

    let filteredData = data;

    if (genreFilter !== "all") {
        if (filterMode === "include") {
            filteredData = data.filter(img => img.genre === genreFilter);
        } else {
            filteredData = data.filter(img => img.genre !== genreFilter);
        }
    }

    filteredData.forEach((img) => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${img.image}" alt="image">
            <p>${img.genre}</p>
            <button onclick="deleteImage(${img.id})">Удалить</button>
        `;

        gallery.appendChild(card);
    });
}


// ===============================
// УДАЛЕНИЕ
// ===============================

async function deleteImage(id) {
    const { error } = await client
        .from("image")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Ошибка удаления:", error);
        return;
    }

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
// ПЕРВЫЙ ЗАПУСК
// ===============================

renderGallery();
