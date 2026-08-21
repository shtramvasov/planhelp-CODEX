import React from 'react';

export default function formatText(text) {
    if (!text) return null;
    
    // Функция для проверки, является ли URL ссылкой на файл
    const isFileUrl = (url) => {
        // Расширения файлов (документы, архивы, видео и т.д.)
        const fileExtensions = [
            // Изображения
            '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico',
            // Документы
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf',
            // Архивы
            '.zip', '.rar', '.7z', '.tar', '.gz',
            // Видео
            '.mp4', '.avi', '.mkv', '.mov', '.wmv',
            // Аудио
            '.mp3', '.wav', '.flac', '.aac',
            // Исполняемые
            '.exe', '.msi', '.apk', '.dmg',
            // Другие
            '.csv', '.json', '.xml', '.yml', '.md'
        ];
        
        const lowerUrl = url.toLowerCase();
        // Убираем параметры запроса для проверки
        const urlWithoutParams = lowerUrl.split('?')[0];
        
        return fileExtensions.some(ext => urlWithoutParams.includes(ext));
    };
    
    // Функция для получения имени файла из URL
    const getFileName = (url) => {
        try {
            // Убираем параметры запроса и якоря
            const urlWithoutParams = url.split('?')[0].split('#')[0];
            
            // Получаем последнюю часть после слеша
            const parts = urlWithoutParams.split('/');
            let fileName = parts[parts.length - 1];
            
            // Декодируем URL (для кириллицы и спецсимволов)
            fileName = decodeURIComponent(fileName);
            
            // Если имя файла пустое, возвращаем полный URL
            if (!fileName || fileName === '') {
                return url;
            }
            
            return fileName;
        } catch (error) {
            // Если декодирование не удалось, пробуем просто взять последнюю часть
            const parts = url.split('/');
            const fileName = parts[parts.length - 1].split('?')[0].split('#')[0];
            return fileName || url;
        }
    };
    
    // Функция для проверки, является ли URL изображением
    const isVideoUrl = (url) => {
        const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv',];
        const lowerUrl = url.toLowerCase();
        const urlWithoutParams = lowerUrl.split('?')[0];
        return videoExtensions.some(ext => urlWithoutParams.includes(ext));
    };

    // Функция для проверки, является ли URL видео
    const isImageUrl = (url) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
        const lowerUrl = url.toLowerCase();
        const urlWithoutParams = lowerUrl.split('?')[0];
        return imageExtensions.some(ext => urlWithoutParams.includes(ext));
    };
    
    // Регулярное выражение для поиска URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Разбиваем текст на строки
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
        if (line.trim() === '') {
            return <br key={`br-${lineIndex}`} />;
        }
        
        // Разбиваем строку на части: текст и URL
        const parts = [];
        let lastIndex = 0;
        let match;
        
        // Сбрасываем lastIndex регулярки
        urlRegex.lastIndex = 0;
        
        while ((match = urlRegex.exec(line)) !== null) {
            // Добавляем текст до URL
            if (match.index > lastIndex) {
                parts.push(line.substring(lastIndex, match.index));
            }
            
            const url = match[0];
            
            // Проверяем, является ли URL изображением
            if (isImageUrl(url)) {
                // Для изображений показываем само изображение
                const fileName = getFileName(url);
                parts.push(
                    <React.Fragment key={`img-${lineIndex}-${match.index}`}>
                        <a href={url} target="_blank">
                            <img 
                                src={url}
                                alt={fileName}
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '300px', 
                                    objectFit: 'contain',
                                    display: 'block',
                                    margin: '5px 0'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </a>
                    </React.Fragment>
                );
            } else
            // Проверяем, является ли URL видео
            if (isVideoUrl(url)) {
                // Для изображений показываем само изображение
                const fileName = getFileName(url);
                parts.push(
                    <React.Fragment key={`img-${lineIndex}-${match.index}`}>
                        <a href={url} target="_blank">
                        <video width="320" height="240" controls>
                            <source src={url} type="video/mp4"/>
                        </video>
                        </a>
                    </React.Fragment>
                );
            } 
            else if (isFileUrl(url)) {
                // Для файлов (не изображения) показываем название файла
                const fileName = getFileName(url);
                parts.push(
                    <a 
                        key={`file-${lineIndex}-${match.index}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                            color: '#2563eb', 
                            textDecoration: 'underline',
                            margin: '0 2px'
                        }}
                        title={url} // Показываем полный URL при наведении
                    >
                        {fileName}
                    </a>
                );
            }
            else {
                // Для обычных ссылок (сайты, страницы) показываем полный URL
                parts.push(
                    <a 
                        key={`link-${lineIndex}-${match.index}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                            color: '#2563eb', 
                            textDecoration: 'underline',
                            margin: '0 2px'
                        }}
                    >
                        {url}
                    </a>
                );
            }
            
            lastIndex = match.index + url.length;
        }
        
        // Добавляем оставшийся текст
        if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
        }
        
        return (
            <React.Fragment key={`line-${lineIndex}`}>
                {parts.length > 0 ? parts : line}
                {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
        );
    });
}