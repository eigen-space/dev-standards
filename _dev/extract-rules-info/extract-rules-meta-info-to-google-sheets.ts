/**
 * Script parses documentation of rules, extracts meta info and add it google sheets.
 *
 * We have general rules and more specific sub rules which disclose the general rules in more detail.
 *
 * Doc structure requirements.
 *
 * Rule structure:
 * - general rule should contain at least two hashes (#)
 * - general rule should have space after hashes
 * - general rule should contain id in format number and dot after number with repeats (1.2.3.)
 * - sub rule should contain id in format cyrillic letter and dot after letter with no repeats (a.)
 * - rule should have space after id
 * - rule can contain status and rule info block:
 *      - block should starts with `\[` and ends with `\]`
 *      - block should contain one of available statuses: `Автоматизировано` | `Не автоматизировано` | `Частично автоматизировано`
 *      - if status is `Не автоматизировано` nothing else are in status and rule info block
 *      - if status is `Автоматизировано` or `Частично автоматизировано` the colon symbol (:) with space should be after status
 *      - if status is `Автоматизировано` or `Частично автоматизировано` the name of rule that automates problem should be specified
 *      - if we have several rules for automation they should be separated by comma (,) and one space
 * - rule should have space after status and rule info block if it was specified
 * - rule should have name of rule
 * - rule should have one empty line after rule row
 *
 * Examples of correct general rules:
 * - ### 1.1. \[Не автоматизировано\] Правила именования
 * - #### 2.1.2. \[Автоматизировано: brace-style\] Непустые блоки
 * - #### 2.1.4. Поля с аннтотациями
 *
 * Examples of correct sub rules:
 * - c. \[Не автоматизировано\] Между последовательно идущими объявлениями полей класса.
 * - a. \[Автоматизировано: newline-per-chained-call\] Выражение должно переноситься по точке.
 * - a. Предпочтительно размещать параметры функции на той же строке, что и имя функции.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Cell, Info, Worksheet } from 'google-spreadsheet';
import * as creds from './credentials/google-sheets-credentials.json';
import { promisify } from 'util';
import { walkThrough } from '@eigenspace/helper-scripts';

// Using require because of import issues
const GoogleSpreadsheet = require('google-spreadsheet');

// The Google Sheet ID found in the URL of your Google Sheet.
const SPREADSHEET_ID = '1phevI9VxclD8QsHYr5Stu-nlvUjJ3taBujgu1JOUqlg';

const PATH_TO_DOCS = '../../';
const FILE_NAME = 'README.md';

interface Rule {
    id: string;
    name: string;
    status: string;
    rule: string;
    localized: string;
    violations: string;
    link: string;

    [key: string]: string | number;
}

enum StatusType {
    AUTOMATED = 'Автоматизировано',
    NON_AUTOMATED = 'Не автоматизировано',
    PARTLY_AUTOMATED = 'Частично автоматизировано'
}

const ID_PATTERN = /((##[#]+ ([\d+.]+))|([a-z]\.))/.toString()
    .slice(1, -1);
const STATUS_PATTERN = Object.values(StatusType).map(statusType => `(${statusType})`)
    .join('|');
const END_PATTERN = new RegExp(`(${os.EOL}.+)*`).toString()
    .slice(1, -1);

const RULE_REGEXP = new RegExp(`${ID_PATTERN} (\\\\\\[(${STATUS_PATTERN})(.*)\\\\\\] )?(.+${END_PATTERN})`, 'gm');

const COLUMNS_COUNT = 7;

accessSpreadsheet();

async function accessSpreadsheet(): Promise<void> {
    // Create a document object using the ID of the spreadsheet - obtained from its URL.
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    // Authenticate with the Google Spreadsheets API.
    await promisify(doc.useServiceAccountAuth.bind(doc))(creds);
    // Get info about worksheets
    const info = await promisify(doc.getInfo)() as Info;

    const sheets: Worksheet[] = info.worksheets;

    walkThrough(PATH_TO_DOCS, async (dir: string, file: string) => {
        if (file !== FILE_NAME) {
            return;
        }

        const docType = dir.split(path.sep)
            .pop();
        const sheet = sheets.find(worksheet => worksheet.title === docType);

        if (!sheet) {
            return;
        }

        await sheet.clear(() => {
        });

        const rules = getRulesData(path.join(dir, file));
        addRows(sheet, rules);
    });
}

async function getCellsTillRow(sheet: Worksheet, maxRow: number): Promise<Cell[]> {
    // @ts-ignore
    return promisify(sheet.getCells)({
        'min-row': 2,
        'max-row': maxRow + 1,
        'max-col': COLUMNS_COUNT,
        'min-col': 1,
        'return-empty': true
    }) as Promise<Cell[]>;
}

async function addRows(sheet: Worksheet, rules: Rule[]): Promise<void> {
    const cells = await getCellsTillRow(sheet, rules.length);
    const subRuleIdRegExp = /^[a-z]/;

    let currentParentId = '';

    rules.forEach((rule: Rule, i: number) => {
        let { id } = rule;

        if (!subRuleIdRegExp.test(id)) {
            currentParentId = id;
        } else {
            id = `${currentParentId}${id}`;
        }

        const rowValues = Object.keys(rule).map(key => key === 'id' ? id : rule[key]);

        rowValues.forEach((ruleValue, j) => {
            const cellIndex = i * rowValues.length + j;
            cells[cellIndex].value = ruleValue;
        });
    });

    return sheet.bulkUpdateCells(cells);
}

function getRulesData(pathToDoc: string): Rule[] {
    const doc = fs.readFileSync(pathToDoc, 'utf8');
    const rules = doc.match(RULE_REGEXP);

    if (!rules) {
        return [];
    }

    return rules.map(rule => {
        RULE_REGEXP.lastIndex = 0;

        const [, , , ruleId, subRuleId, , status, , , , rawRuleName, name] = RULE_REGEXP.exec(rule) as Array<string>;

        const id = ruleId || subRuleId;
        const ruleName = (rawRuleName || '').slice(1)
            .trim();

        return {
            id,
            name,
            status: status || StatusType.NON_AUTOMATED,
            rule: ruleName,
            localized: 'No',
            violations: 'None',
            link: 'link'
        };
    });
}
