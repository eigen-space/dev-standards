---
description: 'Project structure, file names, etc.'
---

# Common

## 0. Introduction

The main goal is to reduce cognitive load, create common expectations, 
increase the readability of code, commits, diagrams or something else.

## 1. Файлы с исходным кодом

### 1.1. Правила именования

1. Имя файла должно быть в нижнем регистре.

```text
    // Плохо
    Tag.ts

    // Хорошо
    tag.ts
```

1. Имя файла может содержать логические группы. Группы разделяются точкой \(символ **.**\).
2. Если имя файла состоит из нескольких слов, то они разделяются дефисом \(символ **-**\).

```text
    // Плохо
    progress_bar.ts

    // Хорошо
    progress-bar.ts
```

### 1.2. Кодировка

Файлы с исходным кодом должны использовать кодировку UTF-8.

### 1.3. Используемые специальные символы

#### 1.3.1. Пробельные

В качестве пробельного символа должен использоваться только символ пробела \(0x20\). Не должно быть использования других пробельных символов. Исключением является только символ завершения строки.

Таким образом, в качестве символа для определения **отступов** также используемся **символ пробела**. Использование **символа табуляции недопустимо**. Величина отступов и их оформление указаны в **п.3.2**.

#### 1.3.2. Использование управляющих последовательностей символов

Если управляющая последовательность имеет своё символьное представление, то следует использовать его, нежели использовать её числовое выражение:

```typescript
    // Плохо
    '\x0a', '\u000a', '\u{a}'

    // Хорошо
    '\'', '\"', '\\', '\b', '\f', '\n', '\r', '\t'
```

#### 1.3.3. Символы вне таблицы ASCII символов

Использовать управляющую последовательность unicode для представления символа, если он является непечатаемым символом. При использовании таких символов обозначать их через константу с однозначным и понятным названием, которое раскрывает смысл используемого символа.

```typescript
    // Плохо
    const currency = '\u20bd';
    // Плохо
    result = '\ufeff' + 'content';
```

```typescript
    // Хорошо
    const currency = '₽';
    // Хорошо
    const MARK_OF_BYTE_ORDER = '\ufeff';
    result = MARK_OF_BYTE_ORDER + 'content';
```

## 2. Структура каталогов

Проект должен придерживаться следующей структуры:

```text
    /src - Файлы, используемые приложением
        /app - Код приложения (модули, шаблоны, логика)
            /common - Общие для модулей приложения сущностями, перечислениями и т.д.
                /<concrete group>
                    *.ts
                    *.spec.ts
                    *.html
            /<module> - Модуль приложения. Например, экран мониторинга, экран планирования
                /<sub_module> - Часть экрана, которая более нигде не используется
                    *.ts
                    *.spec.ts
                    *.html           
            <app root files> - Корневой модуль, файл запуска приложения, корневой шаблон
        /assets - Дополнительные ресурсные файлы
            /favicon - Набор иконок, которые используются для отображения на вкладке браузера, в плитке приложений, ...
                <favicons>
            /fonts - Шрифты
                /<font> - Конкретный шрифт в разных разрешениях
                    *.ttf
                    *.woff
                    *.woff2
            ...
        /data - Заглушки на backend API
            *.tson
        /environments - Наборы констант приложения под разные среды
            environment.prod.ts
            environment.ts   
            ...
        ...
    package.tson - Файл, определяющий зависимости на сторонние для проекта библиотеки
    package-lock.tson - Файл, фиксирующий конкретные номера зависимостей
    README.md
    <другие корневые файлы конфигурации> - Например, karma.conf.ts, .gitignore, .gitlab-ci.yml, .npmrc, ...
```

Пример структуры:

```text
    /src
        /app
            /common
                /components
                    /base
                        base.component.ts
                        base.component.spec.ts
                    /list
                        list.component.ts
                        list.component.spec.ts
                        ...
                    ...
                /entities
                    /tag
                        tag.ts
                        tag.spec.ts
                    /demand
                        demand.ts
                        demand.spec.ts
                    ...
                /enums
                    job_status_type.ts
                    ...
                /exceptions
                    /app_error
                        app_error.ts
                        app_error.spec.ts
                /services
                    /data_loader
                        data_loader.service.ts
                        data_loader.service.spec.ts
                    /job
                        job.service.ts
                        job.service.spec.ts
                    ...
                /utils
                    /logger
                        logger.ts
                        logger.spec.ts
                    ...
            /monitor
                monitor.component.ts
                monitor.component.spec.ts
                monitor.module.ts
            /plan
                ...
            ...
            app.module.ts
            app.routes.ts
        /assets
            /fonts
                /rubik
                    rubik_regular.ttf
                    rubik_regular.woff
                    rubik_regular.woff2
        /data
            zones.list.tson
            ...
        /environments
            environment.prod.ts
            environment.ts
    .editorconfig
    .eslint.ts
    .gitattributes
    .gitignore
    .gitlab_ci.yml
    .htmlhintrc
    .npmrc
    package.tson
    package_lock.tson
    webpack.config.ts
```

## 3. Форматирование

### 3.1. \[Автоматизировано: max-len\] Длина строк

Длина строк не должна превышать **120 символов**. Строка не может быть чуть-чуть длиннее указанной границы. Либо строка соответствует установленному лимиту, либо нет. Если строка превышает ограничение, нужно переносить её части в соответствии с правилами переноса выражений, указанными в разделе **3.5. Перенос выражений**.

**Исключения** составляют только следующие случаи:

* строки, которые не разорвать, например, длинный URL в JSDoc. С похожей ситуацией

  можно столкнуться в json-файлах, которые также встречаются в проектах на javascript.

```typescript
    /**
     * ...
     * Поясняющий пример можно найти по ссылке:
     * http://www.theblaze.com/blog/2011/02/01/kansas-city-star-complains-about-the-lack-of-response-during-his-response-to-the-response-to-his-response-to-a-point-he-didnt-hear-and-doesnt-understand
     */
```

### 3.2. \[Автоматизировано: no-multiple-empty-lines\] Пробельные места

Файл должен завершаться строкой с содержимым, не должно быть пустой строки в конце файла.

## 4. Политики

### 4.1. Код не соответствует правилам руководства

a. Если вносятся существенные изменения в файл, который не соответствует принятым в настоящем руководстве правилам, то следует предварительно выполнить форматирование файла в соответствии с правилами.

b. Если вносятся незначительные изменения в файл, то привести к формату правил только тот участок кода, в который вносятся изменения.

c. Новый код должен соответствовать правилам руководства.

### 4.2. Сгенерированный код

Сгенерированный код, который используется в проекте, может не соответствовать правилам руководства. Однако имена идентификаторов, которые используются в проекте должны соответствовать правилам настоящего руководства. Это соответствие должно быть обеспечено либо на уровне генерируемого кода, либо на уровне приложения за счёт дополнительных преобразований.

### 4.3. Автоматизированные инспекции кода и фиксация изменений

Необходимо уделять внимание автоматизированным инспекция в IDE и инспекциям инструмента проверки кода `eslint` / `tslint`. Недопустимо выполнять фиксацию кода в репозитории, если он не проходит проверку на соответствие принятому стандарту написания кода.

## 5. Правила именования

### 5.1. \[Не автоматизировано\] Общие правила для всех идентификаторов

a. Используются только буквы латинского алфавита `[a-zA-Z]`, цифры `[0-9]`.

b. Необходимо давать максимально говорящие, понятные имена. Делать выбор в пользу более длинного названия, нежели в пользу менее понятного. В то же время необходимо, чтобы названия по возможности состояли из наименьшего количества слов \(в идеале из одного\), и их смысл был ясен, исходя из контекста. Идеальное название - короткое, лаконичное и в то же время полностью раскрывающее назначение.

c. Не использовать аббревиатуры, которые не являются общепринятыми.

d. Не использовать сокращений, которые не являются общепринятыми.

e. Использовать слова `count` и `number of` для названия переменных, в которых содержится некоторое количество. В случаях, когда может быть двусмысленность при использовании `count`, отдавать предпочтение варианту с `number of`

```typescript
    // Плохо

    n // Неговорящее название
    nErr // Неочевидное сокращение
    pcReader // Аббревиатура, у которой может быть несколько значений
    cstmrId // Выброшены гласные буквы из слова
    kSecondsPerDay // Специфичные префиксы

    // Хорошо

    priceCountReader // Без аббревиатур
    numberOfErrors
    dnsConnectionCount
```

h. Не использовать более двух идущих подряд существительных. Добавлять в этом случае какие-то предлоги-связки, например `of`.

```typescript
    // Плохо
    isRunningCalculateCurrentDraft

    // Хорошо
    isRunningCalculationOfCurrentDraft
```

i. Не использовать в качестве названий слова являющиеся служебными для языка.

j. Имена переменных должны состоять из слов, имеющих определенное смысловое значение в английском языке. Не допускается использовать транслитерацию.

k. Не следует использовать венгерскую нотацию, т.е. не нужно кодировать тип в имени переменной.

```typescript
    // Плохо
    iTripNumber

    // Хорошо
    tripNumber
```

### 5.2. Используемые для именования слова и сочетания

| Слово | Парное | Назначение |
| :--- | :--- | :--- |
| enable | disable | Активация/деактивация какого-то элемента. В результате этого действия элемент \(сущность\) становится доступной \(недоступной\). |
| enabled | disabled | Элемент активен/неактивен, т.е. допускает или не допускает взаимодействие с ним. |
| checked | unchecked | Элемент отмечен/ не отмечен \(выбран/не выбран\). Наиболее соответствует ситуации, когда элемент выбирается в списке с флажками \(checkbox'ами\). |
| opened | - | Открыт/не открыт элемент. Например, этот признак может быть у модального окна, выпадающей части поля выбора, контекстного меню. |
| state | - | Используется для именования состояния элемента. |
| filter | - | Используется для именования фильтра. |
| factory | - | Фабрика каких-то объектов. |

