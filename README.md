Yandex-Slideshow
================

Это публичный репозиторий для хранения тестового задания на вакансию разработчика поисковых интерфейсов в Компании Яндекс.

Задание:
Реализуйте систему для показа презентаций. Подумайте над тем, как реализовать переключение слайдов, навигацию.
Предусмотрите возможность размещения нескольких презентаций на одной странице.
Рекомендуется использование jQuery.

Технические характеристики.

В разработке исаользованы следующие библиотеки и плагины:
- jQuery v1.9.1
- jQuery Mousewheel v3.0.6
- jQuery Modal v1.0.1

Поддержка:
MSIE 9+
Mozilla FF 19
Yandex браузер 1.5
Google Chrome 28
Опера 12

Структура:
- index.html страница для примера инициализации презентаций.
- js/slideshow.js файл содержит весь javascript код
- css/slideshowslyles.css файл содержит в себе все стили
- img/ папка с изображениями кнопок и прелоадера

Установка:

Скопировать содержимое репозитория командой:
git clone https://github.com/muftiev/Yandex-Slideshow.git
Открыть файл index.html в браузере или скопировать все файлы (кроме index.html) в любой проект и использовать как плагин.

Инициализация производиться с помощью метода "slideshow" в целевом элементе DOM дерева
$("div").slideshow({
		option1: value1,
		option2: value2,
		...
	});

В качестве опций можно указать параметры конфигурации:

url - адрес загрузки изображений с Yandex API
order - порядок выдачи (см. документацию Yandex API)
limit - количество изображений для загрузки (0 - 100)
thumbnails_size - размер для уменьшенных изображений. Рекомендованные значения ('XXXS' и 'XXS')
image_size - размер основного изображения. Рекомендованые значения ('M', 'L', 'XL')
switch_duration - время переключения между изображениями
width - ширина блока слайдшоу в px (число),
height - высота блока слайдшоу в px (число),
animated - анимация пролистывания слайдов (true/false),
autostart - автоматический запуск первого слайда после инициализации (true/false),
delay - время между автоматической сменой слайдов в тысячных секунды (0 для отключения автоматической смены),
thumb_size - ширина и высота уменьшенного изображения слайда в px (число),
thumb_hide - скрывающяяся панель уменьшенных изображений слайдов (true/false),
fullsize - функция показа во весь размер окна браузера (true/false),
loader - прелоадер загрузки уменьшенных изображений (true/false),
username - имя пользователя на яндек фотках, у которого хранятся изображения слайдов,
album - название альбома

Управление показом слайдов:

Навигация по слайдам может осуществляться с помощью стрелок навигации в левом нижнем углу
или кликами по уменьшенным изображениям в панели справа.
Доступна опция автопоказа с заданным промежутком времени.
Во время автопоказа также доступна ручная навигация.
Реализована опция показа в полный размер окна браузера. В данном режиме стандартная навигация
заменена навигацией при помощи клавиатуры: стрелки влево(назад), вправо и пробел(вперед), Esc(выход из полноразмерного режима).
Также в этом режиме на клик по слайду происходит навигация вперед.

Особенности функционирования Слайдшоу:

После инициализации начинается загрузка уменьшенных изображений в панель справа. Загружается часть изображений (количество равно
числу изображений помещающихся в блоке умноженному на 2). Дозагрузка производится такими же частями при приближении к концу списка.
Уменьшенное изображение активного слайда всегда центрируется в панели навигации. Сами слайды загружаются непосредственно перед их 
отображением в слайдшоу.

Использование готовых решений:

Для реализации скролла в панели уменьшенных изображений используется плагин jQuery Mousewheel. С помощью него стандартная прокрутка
заменена анимацией фиксированной длины.
Полноразмерный режим реализован при помощи плагина jQuery Modal, который позволяет выводить контент в модальном окне поверх страницы сайта.