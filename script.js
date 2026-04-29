// ===============================
// 🌐 ПОДКЛЮЧЕНИЕ К SUPABASE
// ===============================

// const — переменные, которые нельзя менять (адрес и ключ фиксированы)
const supabaseUrl = "https://aoaafscgnmtnszopfzaj.supabase.co";
const supabaseKey = "ТВОЙ_API_КЛЮЧ";

// создаём "клиента" — это мост между сайтом и облачной базой данных
const client = supabase.createClient(supabaseUrl, supabaseKey);


// ===============================
// 📥 ЗАГРУЗКА ФАЙЛА (ОСНОВНАЯ ЛОГИКА)
// ===============================

async function handleFile(file, genre = "other") {
    // если файл не выбран — стопаем функцию
    if (!file) {
        alert("Выберите файл.");
        return;
    }

    // список разрешённых форматов изображений
    const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/jpg"
    ];

    // проверка формата файла
    if (!validTypes.includes(file.type)) {
        alert("Этот формат не поддерживается.");
        return;
    }

    // FileReader — встроенный объект для чтения файлов
    const reader = new FileReader();

    // когда файл прочитан — выполняется этот код
    reader.onload = async function (event) {

        // превращаем изображение в строку (Base64)
        const base64Image = event.target.result;

        // отправляем данные в базу данных Supabase
        const { error } = await client
            .from("image") // таблица
            .insert([
                {
                    image: base64Image, // сама картинка
                    genre: genre,       // жанр
                    title: file.name    // имя файла
                }
            ]);

        // если ошибка — выводим в консоль
        if (error) {
            console.error("Ошибка загрузки:", error);
            alert("Не удалось загрузить изображение.");
            return;
        }

        // обновляем галерею после загрузки
        renderGallery();
    };

    // запускаем чтение файла
    reader.readAsDataURL(file);
}


// ===============================
// ⬆️ КНОПКА "ЗАГРУЗИТЬ"
// ===============================

function addImage() {
    // берём файл из input
    const input = document.getElementById("uploadInput");

    // берём выбранный жанр
    const genre = document.getElementById("genreSelect").value;

    // первый выбранный файл
    const file = input.files[0];

    // отправляем в обработчик
    handleFile(file, genre);

    // очищаем input (чтобы можно было загрузить тот же файл снова)
    input.value = "";
}


// ===============================
// 🖼 ОТОБРАЖЕНИЕ ГАЛЕРЕИ
// ===============================

async function renderGallery() {
    // контейнер галереи
    const gallery = document.getElementById("gallery");

    // очищаем старые карточки
    gallery.innerHTML = "";

    // получаем данные из базы
    const { data, error } = await client
        .from("image")
        .select("*")
        .order("id", { ascending: false }); // новые сверху

    // если ошибка — выводим
    if (error) {
        console.error("Ошибка загрузки:", error);
        return;
    }

    // получаем значения фильтра
    const filterMode = document.getElementById("filterMode").value;
    const genreFilter = document.getElementById("genreFilter").value;

    // копируем данные для фильтрации
    let filteredData = data;

    // если выбран не "все"
    if (genreFilter !== "all") {

        // include = показываем только выбранное
        if (filterMode === "include") {
            filteredData = data.filter(img => img.genre === genreFilter);
        }

        // exclude = скрываем выбранное
        else {
            filteredData = data.filter(img => img.genre !== genreFilter);
        }
    }

    // создаём карточки
    filteredData.forEach((img) => {

        const card = document.createElement("div");
        card.className = "card";

        // внутренняя разметка карточки
        card.innerHTML = `
            <img src="${img.image}" alt="image">
            <p>${img.genre}</p>
            <button onclick="deleteImage(${img.id})">Удалить</button>
        `;

        // добавляем в галерею
        gallery.appendChild(card);
    });
}


// ===============================
// 🗑 УДАЛЕНИЕ ИЗОБРАЖЕНИЯ
// ===============================

async function deleteImage(id) {

    // удаляем запись по id
    const { error } = await client
        .from("image")
        .delete()
        .eq("id", id);

    // если ошибка
    if (error) {
        console.error("Ошибка удаления:", error);
        return;
    }

    // обновляем галерею
    renderGallery();
}


// ===============================
// 🖱 DRAG & DROP (перетаскивание файлов)
// ===============================

// находим зону перетаскивания
const dropZone = document.getElementById("dropZone");

// когда файл над зоной
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault(); // обязательно для работы drop
    dropZone.classList.add("dragover");
});

// когда файл уходит из зоны
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

// когда файл отпущен
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    // проверяем что это изображение
    if (file && file.type.startsWith("image/")) {
        handleFile(file, "other");
    }
});


// ===============================
// 🚀 ПЕРВЫЙ ЗАПУСК САЙТА
// ===============================

// при открытии сайта сразу загружаем галерею
renderGallery();
