// patterns-dictionary.js - VERSIÓN MEGA ROBUSTA CON VALIDACIONES INTELIGENTES
class PatternsDictionary {
    constructor() {
        this.initializePatterns();
    }

    initializePatterns() {
        // ========== PATRONES DE TECLADO MEGA EXPANDIDOS ==========
        this.keyboardPatterns = [
            // Filas completas QWERTY en todas las variaciones
            'qwertyuiop', 'qwertyuio', 'qwertyui', 'qwertyu', 'qwerty', 'wertyu', 'ertyu', 'rtyui', 'tyuio', 'yuiop',
            'asdfghjkl', 'asdfghjk', 'asdfghj', 'asdfgh', 'asdfg', 'sdfgh', 'dfghj', 'fghjk', 'ghjkl',
            'zxcvbnm', 'zxcvbn', 'zxcvb', 'zxcv', 'xcvbn', 'cvbnm', 'vbnm', 'bnmq', 'nmqw', 'mqwe', 'qwer',

            // Filas en reversa completas
            'poiuytrewq', 'poiuytre', 'poiuyt', 'poiuy', 'oiuyt', 'iuytre', 'uytrew', 'ytrewq', 'trewq', 'rewq',
            'lkjhgfdsa', 'lkjhgfd', 'lkjhgf', 'lkjhg', 'kjhgf', 'jhgfd', 'hgfds', 'gfdsa', 'fdsa', 'dsa',
            'mnbvcxz', 'mnbvcx', 'mnbvc', 'nbvcx', 'bvcxz', 'vcxz', 'cxz', 'xz', 'zxc', 'xcv',

            // Patrones diagonales ultra expandidos
            'qaz', 'qsz', 'qxc', 'qdv', 'qfb', 'qgn', 'qhm', 'qjn', 'qkm', 'ql', 'qa', 'qz',
            'wsx', 'wdc', 'wev', 'wrb', 'wtg', 'wyh', 'wun', 'wij', 'wok', 'wpl', 'ws', 'wx',
            'edc', 'edv', 'efb', 'erg', 'eth', 'eyj', 'euk', 'eio', 'eip', 'ed', 'ec',
            'rfv', 'rgb', 'rth', 'ryj', 'ruk', 'rio', 'rip', 'rf', 'rv',
            'tgb', 'tyh', 'tuj', 'tik', 'tol', 'top', 'tg', 'tb',
            'yhn', 'yuj', 'yik', 'yol', 'yop', 'yh', 'yn',
            'ujm', 'uik', 'uol', 'uop', 'uj', 'um',
            'ik', 'iol', 'iop', 'ik', 'il',
            'ol', 'op', 'ok', 'ol',
            'p', 'o', 'i', 'u', 'y',

            // Patrones en forma de cruz
            'qweasdzxc', 'asdzxc', 'qwezxc', 'qweasd', 'rfvtgb', 'yhnujm', 'yhnujmik',
            'edcrfv', 'rfvtgb', 'tgb', 'yhn', 'ujm', 'ik', 'ol', 'p',

            // Patrones en espiral
            'qazwsxedc', 'wsxedcrfv', 'edcrfvtgb', 'rfvtgbyhn', 'tgbyhnujm',
            'zaqxswcde', 'xswcdevfr', 'cdevfrbgt', 'vfrbgtnhy'
        ];

        // ========== SECUENCIAS ALFABÉTICAS MEGA EXPANDIDAS ==========
        this.sequencePatterns = [
            // Ascendentes completas y parciales
            'abcdefghijklmnopqrstuvwxyz', 'abcdefghijklm', 'nopqrstuvwxyz',
            'abcdefgh', 'bcdefghi', 'cdefghij', 'defghijk', 'efghijkl', 'fghijklm',
            'ghijklmn', 'hijklmno', 'ijklmnop', 'jklmnopq', 'klmnopqr', 'lmnopqrs',
            'mnopqrst', 'nopqrstu', 'opqrstuv', 'pqrstuvw', 'qrstuvwx', 'rstuvwxy',
            'stuvwxyz', 'tuvwxyz', 'uvwxyz', 'vwxyz', 'wxyz', 'xyz', 'yz', 'z',

            // Descendentes completas y parciales
            'zyxwvutsrqponmlkjihgfedcba', 'zyxwvutsrqpon', 'mlkjihgfedcba',
            'zyxwv', 'yxwvu', 'xwvut', 'wvuts', 'vutsr', 'utsrq', 'tsrqp',
            'srqpo', 'rqpon', 'qponm', 'ponml', 'onmlk', 'nmlkj', 'mlkji',
            'lkjih', 'kjihg', 'jihgf', 'ihgfe', 'hgfed', 'gfedc', 'fedcb',
            'edcba', 'dcba', 'cba', 'ba', 'a',

            // Secuencias saltadas
            'acegikmoqsuwy', 'bdfhjlnprtvxz', 'adgjmpsvy', 'behknqtwz', 'cfilorux',
            'abcabc', 'defdef', 'ghighi', 'jkljkl', 'mnopmnop', 'qrsqrs', 'tuvtuv', 'wxyzwxyz',

            // Secuencias repetitivas
            'abcabc', 'abcdabcd', 'abcdeabcde', 'abcdefabcdef',
            'xyzxyz', 'wxyzwxyz', 'vwxyzvwxyz', 'uvwxyzuvwxyz'
        ];

        // ========== SECUENCIAS NUMÉRICAS MEGA EXPANDIDAS ==========
        this.numberSequences = [
            // Ascendentes
            '1234567890', '123456789', '12345678', '1234567', '123456', '12345', '1234', '123', '12',
            '234567890', '23456789', '2345678', '234567', '23456', '2345', '234',
            '34567890', '3456789', '345678', '34567', '3456', '345',
            '4567890', '456789', '45678', '4567', '456',
            '567890', '56789', '5678', '567',
            '67890', '6789', '678',
            '7890', '789',
            '890', '901', '012',

            // Descendentes
            '9876543210', '987654321', '98765432', '9876543', '987654', '98765', '9876', '987', '98',
            '876543210', '87654321', '8765432', '876543', '87654', '8765', '876',
            '76543210', '7654321', '765432', '76543', '7654', '765',
            '6543210', '654321', '65432', '6543', '654',
            '543210', '54321', '5432', '543',
            '43210', '4321', '432',
            '3210', '321',
            '210', '109', '098',

            // Secuencias repetitivas numéricas
            '123123', '12341234', '1234512345', '123456123456',
            '321321', '43214321', '5432154321', '654321654321',

            // Patrones numéricos comunes
            '1212', '1313', '1414', '1515', '1616', '1717', '1818', '1919', '2020',
            '1122', '1133', '1144', '1155', '1166', '1177', '1188', '1199',
            '1010', '2020', '3030', '4040', '5050', '6060', '7070', '8080', '9090'
        ];

        // ========== PATRONES REPETITIVOS MEGA EXPANDIDOS ==========
        this.repetitionPatterns = [
            // RISA Y EXPRESIONES COMUNES EN ESPAÑOL
            'jajaja', 'jajaj', 'jajajaja', 'jajajajaja', 'jejeje', 'jejej', 'jejejeje',
            'jijiji', 'jijij', 'jijijiji', 'jojojo', 'jojoj', 'jojojojo', 'jujuju', 'jujuj',
            'ajajaj', 'ajaja', 'ejjeje', 'ijijij', 'ojojoj', 'ujujuj',

            // SECUENCIAS CON TODAS LAS CONSONANTES
            'lalala', 'lalal', 'lalala', 'lelele', 'lelel', 'lelele',
            'lilili', 'lilil', 'lilili', 'lololo', 'lolol', 'lololo', 'lululu', 'lulul',

            'nanana', 'nanan', 'nanana', 'nenene', 'nenen', 'nenene',
            'ninini', 'ninin', 'ninini', 'nonono', 'nonon', 'nonono', 'nununu', 'nunun',

            'mamama', 'mamam', 'mamama', 'mememe', 'memem', 'mememe',
            'mimimi', 'mimim', 'mimimi', 'momomo', 'momom', 'momomo', 'mumumu', 'mumum',

            'papapa', 'papap', 'papapa', 'pepepe', 'pepep', 'pepepe',
            'pipipi', 'pipip', 'pipipi', 'popopo', 'popop', 'popopo', 'pupupu', 'pupup',

            'tatata', 'tatat', 'tatata', 'tetete', 'tetet', 'tetete',
            'tititi', 'titit', 'tititi', 'tototo', 'totot', 'tototo', 'tututu', 'tutut',

            'bababa', 'babab', 'bababa', 'bebebe', 'bebeb', 'bebebe',
            'bibibi', 'bibib', 'bibibi', 'bobobo', 'bobob', 'bobobo', 'bububu', 'bubub',

            'dadada', 'dadad', 'dadada', 'dedede', 'deded', 'dedede',
            'dididi', 'didid', 'dididi', 'dododo', 'dodod', 'dododo', 'dududu', 'dudud',

            'fafafa', 'fafaf', 'fafafa', 'fefefe', 'fefef', 'fefefe',
            'fififi', 'fifif', 'fififi', 'fofofo', 'fofof', 'fofofo', 'fufufu', 'fufuf',

            'gagaga', 'gagag', 'gagaga', 'gegege', 'gegeg', 'gegege',
            'gigigi', 'gigig', 'gigigi', 'gogogo', 'gogog', 'gogogo', 'gugugu', 'gugug',

            'hahaha', 'hahah', 'hahaha', 'hehehe', 'heheh', 'hehehe',
            'hihihi', 'hihih', 'hihihi', 'hohoho', 'hohoh', 'hohoho', 'huhuhu', 'huhuh',

            'kakaka', 'kakak', 'kakaka', 'kekeke', 'kekek', 'kekeke',
            'kikiki', 'kikik', 'kikiki', 'kokoko', 'kokok', 'kokoko', 'kukuku', 'kukuk',

            'rarara', 'rarar', 'rarara', 'rerere', 'rerer', 'rerere',
            'ririri', 'ririr', 'ririri', 'rororo', 'roror', 'rororo', 'rururu', 'rurur',

            'sasasa', 'sasas', 'sasasa', 'sesese', 'seses', 'sesese',
            'sisisi', 'sisis', 'sisisi', 'sososo', 'sosos', 'sososo', 'sususu', 'susus',

            'wawawa', 'wawaw', 'wawawa', 'wewewe', 'wewew', 'wewewe',
            'wiwiwi', 'wiwiw', 'wiwiwi', 'wowowo', 'wowow', 'wowowo', 'wuwuwu', 'wuwuw',

            'yayaya', 'yayay', 'yayaya', 'yeyeye', 'yeyey', 'yeyeye',
            'yiyiyi', 'yiyiy', 'yiyiyi', 'yoyoyo', 'yoyoy', 'yoyoyo', 'yuyuyu', 'yuyuy',

            'zazaza', 'zazaz', 'zazaza', 'zezaze', 'zezaz', 'zezaze',
            'zizizi', 'ziziz', 'zizizi', 'zozozo', 'zozoz', 'zozozo', 'zuzuzu', 'zuzuz',

            // PATRONES MIXTOS Y SIN SENTIDO
            'saydn', 'tyow', 'rtyu', 'fghj', 'vbnm', 'xswq', 'cdza', 'ujmy', 'iklp',
            'qscwd', 'wedcf', 'erfgv', 'rtgbh', 'tyhjn', 'yujmk', 'uikol', 'iolp',
            'asdxc', 'sdfcv', 'dfgbn', 'fghjm', 'ghjkn', 'hjklm', 'jklmn',
            'zxcva', 'xcvb', 'cvbn', 'vbnm', 'bnmq', 'nmqw', 'mqwe',
            'qwert', 'asdfg', 'zxcvb', 'yuiop', 'hjkl', 'vbnm'
        ];

        // ========== EXPRESIONES REGULARES INTELIGENTES ==========
        this.regexPatterns = {
            // Validación de palabra: mínimo 3 letras con al menos 1 vocal y 1 consonante
            validWord: /^(?=.*[aeiouáéíóú])(?=.*[bcdfghjklmnpqrstvwxyz])[a-záéíóúñ]{3,}$/i,

            // Solo consonantes (3+ caracteres) - NO PERMITIDO
            onlyConsonants: /^[bcdfghjklmnpqrstvwxyz]{3,}$/i,

            // Solo vocales (3+ caracteres) - NO PERMITIDO
            onlyVowels: /^[aeiouáéíóú]{3,}$/i,

            // Grupos de consonantes (4+ seguidas)
            consonantClusters: /[bcdfghjklmnpqrstvwxyz]{4,}/gi,

            // Grupos de vocales (4+ seguidas)
            vowelClusters: /[aeiouáéíóú]{4,}/gi,

            // Repeticiones de caracteres (3+ del mismo)
            repeatedChars: /(.)\1{2,}/g,

            // Patrones de teclado
            keyboardRows: /(qwertyuiop|asdfghjkl|zxcvbnm|poiuytrewq|lkjhgfdsa|mnbvcxz)/gi,

            // Secuencias alfabéticas (3+ caracteres)
            alphabetSequences: /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|cba|dcb|edc|fed|gfe|hgf|ihg|jih|kji|lkj|mlk|nml|onm|pon|qpo|rqp|srq|tsr|uts|vut|wvu|xwv|yxw|zyx)/gi,

            // Secuencias numéricas (3+ números) - solo si están solas
            numberSequences: /(123|234|345|456|567|678|789|890|012|987|876|765|654|543|432|321|210)/g,

            // Mezclas aleatorias número-letra (patrones específicos)
            randomMixed: /[a-z][0-9][a-z][0-9][a-z][0-9]/gi,

            // Caracteres especiales al inicio
            startsWithSpecial: /^[^a-zA-Z0-9\sáéíóúñ]/,
            startsWithNumber: /^[0-9]/,

            // Patrones permitidos: números después de palabras (producto 2, 2kg, 4lb, etc.)
            allowedNumberAfterWord: /^[a-záéíóúñ]+\s+[0-9]+(kg|lb|g|ml|l|cm|m)?$/i,
            allowedNumberWithUnit: /^[0-9]+(kg|lb|g|ml|l|cm|m)$/i
        };

        this.thresholds = {
            minLength: 2,
            maxKeyboardSequence: 5,
            maxEntropy: 4.2,
            minWordLength: 3
        };
    }

    // En el método isValidText, modificar la validación básica:
    isValidText(text, options = {}) {
        const defaults = {
            minLength: 1, // Cambiado a 1 porque ahora validamos palabras
            maxLength: 100,
            strictMode: false
        };

        const config = { ...defaults, ...options };
        const cleanText = text.trim();

        // Validación básica
        if (!this.basicValidation(cleanText, config)) {
            return false;
        }

        const words = cleanText.split(/\s+/).filter(word => word.length > 0);

        // Verificar que todas las palabras de 3+ letras tengan estructura válida
        for (let word of words) {
            const cleanWord = word.replace(/[^a-zA-Záéíóúñ]/g, '');

            // Si la palabra tiene 3+ letras, debe tener al menos 1 vocal y 1 consonante
            if (cleanWord.length >= 3) {
                const hasVowel = /[aeiouáéíóú]/i.test(cleanWord);
                const hasConsonant = /[bcdfghjklmnpqrstvwxyz]/i.test(cleanWord);

                if (!hasVowel || !hasConsonant) {
                    return false;
                }
            }
        }

        // Para textos muy cortos, validación más simple
        if (cleanText.length <= 3) {
            return true;
        }

        // Ejecutar verificaciones
        const checks = this.runAllChecks(cleanText, words);

        // Evaluar resultados de manera inteligente
        return this.evaluateResults(checks, config, cleanText, words);
    }

    // En basicValidation, actualizar:
    basicValidation(text, config) {
        if (!text || text.length < config.minLength || text.length > config.maxLength) {
            return false;
        }

        // No puede comenzar con número o carácter especial
        if (this.regexPatterns.startsWithNumber.test(text) ||
            this.regexPatterns.startsWithSpecial.test(text)) {
            return false;
        }

        return true;
    }
    runAllChecks(text, words) {
        const cleanText = text.toLowerCase();

        return {
            hasKeyboardPatterns: this.hasKeyboardPatterns(cleanText),
            hasSequencePatterns: this.hasSequencePatterns(cleanText),
            hasNumberSequences: this.hasNumberSequences(cleanText, words),
            hasRepetitionPatterns: this.hasRepetitionPatterns(cleanText),
            hasOnlyConsonants: this.hasOnlyConsonants(words),
            hasOnlyVowels: this.hasOnlyVowels(words),
            hasConsonantClusters: this.hasConsonantClusters(cleanText),
            hasVowelClusters: this.hasVowelClusters(cleanText),
            hasAlphabetSequence: this.hasAlphabetSequence(cleanText),
            hasRandomMixed: this.hasRandomMixed(cleanText),
            isTooRandom: this.isTooRandom(cleanText)
        };
    }

    evaluateResults(checks, config, text, words) {
        // Fallos críticos - siempre rechazar
        const criticalFailures = [
            checks.hasKeyboardPatterns,
            checks.hasSequencePatterns,
            checks.hasOnlyConsonants,
            checks.hasOnlyVowels,
            checks.hasRandomMixed
        ];

        // Fallos de advertencia - evaluar según contexto
        const warningFailures = [
            checks.hasNumberSequences,
            checks.hasRepetitionPatterns,
            checks.hasConsonantClusters,
            checks.hasVowelClusters,
            checks.hasAlphabetSequence,
            checks.isTooRandom
        ];

        // Si hay algún fallo crítico, rechazar
        if (criticalFailures.some(check => check)) {
            return false;
        }

        // Contar fallos de advertencia
        const failedWarnings = warningFailures.filter(check => check).length;

        // En modo estricto: máximo 1 fallo de advertencia
        if (config.strictMode) {
            return failedWarnings <= 1;
        }

        // En modo normal: más permisivo, considerar el contexto
        if (failedWarnings <= 2) {
            return true;
        }

        // Si tiene muchos fallos pero el texto parece legítimo, dar otra oportunidad
        return this.isLikelyLegitimateText(text, words);
    }

    isLikelyLegitimateText(text, words) {
        // Si tiene múltiples palabras, es más probable que sea legítimo
        if (words.length >= 2) {
            return true;
        }

        // Si contiene caracteres especiales permitidos (ñ, tildes)
        if (/[áéíóúñ]/i.test(text)) {
            return true;
        }

        // Si parece una palabra real en español
        if (this.looksLikeSpanishWord(text)) {
            return true;
        }

        return false;
    }

    looksLikeSpanishWord(text) {
        const cleanText = text.toLowerCase();

        // Patrones comunes en palabras españolas
        const spanishPatterns = [
            /ción$/i, /mente$/i, /ando$/i, /iendo$/i, /ado$/i, /ido$/i,
            /ar$/, /er$/, /ir$/, /oso$/i, /osa$/i, /able$/i, /ible$/i,
            /dad$/i, /tad$/i, /ez$/i, /eza$/i, /anza$/i, /encia$/i
        ];

        // Verificar si termina con patrones españoles comunes
        return spanishPatterns.some(pattern => pattern.test(cleanText));
    }

    hasKeyboardPatterns(text) {
        const cleanText = text.replace(/[^a-z]/g, '');
        if (cleanText.length < 5) return false;

        // Solo verificar patrones largos
        for (let pattern of this.keyboardPatterns) {
            if (pattern.length >= 5 && cleanText.includes(pattern)) {
                return true;
            }
        }

        return this.regexPatterns.keyboardRows.test(cleanText);
    }

    hasSequencePatterns(text) {
        const cleanText = text.replace(/[^a-z]/g, '');
        // Solo secuencias muy largas y obvias
        return this.sequencePatterns.some(sequence =>
            sequence.length >= 6 && cleanText.includes(sequence)
        ) || this.regexPatterns.alphabetSequences.test(cleanText);
    }

    hasNumberSequences(text, words) {
        // Solo verificar secuencias numéricas si están solas o en contextos no permitidos
        const hasPureNumberSequence = this.numberSequences.some(sequence =>
            text.includes(sequence)
        ) || this.regexPatterns.numberSequences.test(text);

        if (!hasPureNumberSequence) return false;

        // Verificar si los números están en contextos permitidos
        for (let word of words) {
            if (/[0-9]/.test(word)) {
                // Si es un número después de palabra (producto 2) o con unidad (2kg), permitir
                if (this.regexPatterns.allowedNumberAfterWord.test(word) ||
                    this.regexPatterns.allowedNumberWithUnit.test(word)) {
                    continue;
                }
                // Si es solo una secuencia numérica, rechazar
                if (/^[0-9]+$/.test(word) || this.regexPatterns.numberSequences.test(word)) {
                    return true;
                }
            }
        }

        return false;
    }

    hasRepetitionPatterns(text) {
        const cleanText = text.replace(/[^a-z]/g, '');

        if (this.repetitionPatterns.some(pattern =>
            pattern.length >= 4 && cleanText.includes(pattern))) {
            return true;
        }

        return this.regexPatterns.repeatedChars.test(cleanText);
    }

    hasOnlyConsonants(words) {
        return words.some(word => {
            const cleanWord = word.replace(/[^a-záéíóúñ]/gi, '');
            // Solo considerar palabras de 3+ caracteres sin vocales
            return cleanWord.length >= 3 && this.regexPatterns.onlyConsonants.test(cleanWord);
        });
    }

    hasOnlyVowels(words) {
        return words.some(word => {
            const cleanWord = word.replace(/[^a-záéíóúñ]/gi, '');
            // Solo considerar palabras de 3+ caracteres sin consonantes
            return cleanWord.length >= 3 && this.regexPatterns.onlyVowels.test(cleanWord);
        });
    }

    hasConsonantClusters(text) {
        return this.regexPatterns.consonantClusters.test(text);
    }

    hasVowelClusters(text) {
        return this.regexPatterns.vowelClusters.test(text);
    }

    hasAlphabetSequence(text) {
        return this.regexPatterns.alphabetSequences.test(text);
    }

    hasRandomMixed(text) {
        return this.regexPatterns.randomMixed.test(text);
    }

    isTooRandom(text) {
        const cleanText = text.replace(/[^a-z]/g, '');
        if (cleanText.length < 8) return false;

        const entropy = this.calculateEntropy(cleanText);
        return entropy > this.thresholds.maxEntropy;
    }

    calculateEntropy(text) {
        if (text.length === 0) return 0;

        const charCount = {};
        for (let char of text) {
            charCount[char] = (charCount[char] || 0) + 1;
        }

        let entropy = 0;
        const totalChars = text.length;
        for (let char in charCount) {
            const probability = charCount[char] / totalChars;
            entropy -= probability * Math.log2(probability);
        }
        return entropy;
    }

    // ========== MÉTODO DE PRUEBA ==========
    testText(text) {
        console.log(`🔍 Analizando: "${text}"`);
        const analysis = this.analyzeText(text);
        console.log(`✅ Válido: ${analysis.isValid}`);
        console.log(`📊 Longitud: ${analysis.length}`);
        console.log(`❌ Fallos: ${analysis.failedChecks}`);
        analysis.suggestions.forEach(suggestion => console.log(`💡 ${suggestion}`));
        console.log('---');
        return analysis;
    }

    analyzeText(text) {
        const cleanText = text.trim();
        const words = cleanText.split(/\s+/).filter(word => word.length > 0);
        const checks = this.runAllChecks(cleanText, words);

        return {
            text: cleanText,
            length: cleanText.length,
            words: words,
            checks: checks,
            failedChecks: Object.values(checks).filter(check => check).length,
            suggestions: this.generateSuggestions(checks),
            isValid: this.isValidText(cleanText)
        };
    }

    generateSuggestions(checks) {
        const suggestions = [];

        if (checks.hasKeyboardPatterns) suggestions.push('Evite secuencias del teclado');
        if (checks.hasSequencePatterns) suggestions.push('Evite secuencias alfabéticas');
        if (checks.hasNumberSequences) suggestions.push('Evite secuencias numéricas solas');
        if (checks.hasOnlyConsonants) suggestions.push('Las palabras deben tener vocales');
        if (checks.hasOnlyVowels) suggestions.push('Las palabras deben tener consonantes');
        if (checks.hasRepetitionPatterns) suggestions.push('Evite patrones repetitivos');

        return suggestions.length > 0 ? suggestions : ['Texto válido'];
    }
}

// ========== PRUEBAS ==========
const detector = new PatternsDictionary();

// Deberían pasar (textos válidos)
console.log('=== TEXTOS VÁLIDOS (deben pasar) ===');
detector.testText("producto 2");
detector.testText("comida 4kg");
detector.testText("accesorio 10lb");
detector.testText("juguete 2");
detector.testText("medicina 6ml");
detector.testText("alimento 2kg para perros");
detector.testText("casa grande");
detector.testText("teclado inalámbrico");
detector.testText("canción");
detector.testText("rápidamente");

// Deberían fallar (textos inválidos)
console.log('=== TEXTOS INVÁLIDOS (deben fallar) ===');
detector.testText("qwertyuiop");
detector.testText("asdfghjkl");
detector.testText("1234567890");
detector.testText("bcdfghjk");
detector.testText("aeiouaeiou");
detector.testText("a1b2c3d4e5");
detector.testText("lalala");
detector.testText("jajajaja");

// Crear instancia global
if (typeof window !== 'undefined' && typeof window.patternsDictionary === 'undefined') {
    window.patternsDictionary = new PatternsDictionary();
}

