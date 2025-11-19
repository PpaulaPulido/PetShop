class PatternsDictionary {
    constructor() {
        this.initializePatterns();
    }

    initializePatterns() {
        // ========== PATRONES DE TECLADO MEGA EXPANDIDOS ==========
        this.keyboardPatterns = [
            // ========== FILAS QWERTY COMPLETAS Y PARCIALES ==========
            'qwertyuiop', 'qwertyuio', 'qwertyui', 'qwertyu', 'qwerty', 'wertyuiop', 'wertyuio', 'wertyui', 'wertyu', 'werty',
            'ertyuiop', 'ertyuio', 'ertyui', 'ertyu', 'erty', 'rtyuiop', 'rtyuio', 'rtyui', 'rtyu', 'rty',
            'tyuiop', 'tyuio', 'tyui', 'tyu', 'ty', 'yuiop', 'yuio', 'yui', 'yu', 'y',
            'asdfghjkl', 'asdfghjk', 'asdfghj', 'asdfgh', 'asdfg', 'sdfghjkl', 'sdfghjk', 'sdfghj', 'sdfgh', 'sdfg',
            'dfghjkl', 'dfghjk', 'dfghj', 'dfgh', 'dfg', 'fghjkl', 'fghjk', 'fghj', 'fgh', 'fg',
            'ghjkl', 'ghjk', 'ghj', 'gh', 'g', 'hjkl', 'hjk', 'hj', 'h',
            'zxcvbnm', 'zxcvbn', 'zxcvb', 'zxcv', 'zxc', 'xcvbnm', 'xcvbn', 'xcvb', 'xcv', 'xc',
            'cvbnm', 'cvbn', 'cvb', 'cv', 'c', 'vbnm', 'vbn', 'vb', 'v', 'bnm', 'bn', 'b', 'nm', 'n', 'm',

            // ========== FILAS QWERTY EN REVERSA ==========
            'poiuytrewq', 'poiuytre', 'poiuyt', 'poiuy', 'poiu', 'oiuytrewq', 'oiuytre', 'oiuyt', 'oiuy', 'oiu',
            'iuytrewq', 'iuytre', 'iuyt', 'iuy', 'iu', 'uytrewq', 'uytre', 'uyt', 'uy', 'u',
            'ytrewq', 'ytre', 'ytr', 'yt', 'y', 'trewq', 'tre', 'tr', 't', 'rewq', 're', 'r',
            'lkjhgfdsa', 'lkjhgfd', 'lkjhgf', 'lkjhg', 'lkjh', 'kjhgfdsa', 'kjhgfd', 'kjhgf', 'kjhg', 'kjh',
            'jhgfdsa', 'jhgfd', 'jhgf', 'jhg', 'jh', 'hgfdsa', 'hgfds', 'hgfd', 'hgf', 'hg',
            'gfdsa', 'gfds', 'gfd', 'gf', 'g', 'fdsa', 'fds', 'fd', 'f', 'dsa', 'ds', 'd', 'sa', 's', 'a',
            'mnbvcxz', 'mnbvcx', 'mnbvc', 'mnbv', 'mnb', 'nbvcxz', 'nbvcx', 'nbvc', 'nbv', 'nb',
            'bvcxz', 'bvcx', 'bvc', 'bv', 'b', 'vcxz', 'vcx', 'vc', 'v', 'cxz', 'cx', 'c', 'xz', 'x', 'z',

            // ========== FILAS QWERTZ (EUROPA) ==========
            'qwertzuiop', 'qwertzui', 'qwertzu', 'qwertz', 'wertzuiop', 'wertzui', 'wertzu', 'wertz',
            'ertzuiop', 'ertzui', 'ertzu', 'ertz', 'rtzuiop', 'rtzui', 'rtzu', 'rtz',
            'asdfghjkl', 'asdfghjk', 'asdfghj', 'asdfgh', 'asdfg', 'sdfghjkl', 'sdfghjk', 'sdfghj', 'sdfgh',
            'yxcvbnm', 'yxcvbn', 'yxcvb', 'yxcv', 'yxc', 'xcvbnm', 'xcvbn', 'xcvb', 'xcv',
            'poiuztrewq', 'poiuztre', 'poiuzt', 'poiuz', 'lkjhgfdsa', 'lkjhgfd', 'lkjhgf', 'lkjhg',
            'mnbvcxy', 'mnbvcx', 'mnbvc', 'mnbv', 'qwertz', 'aszt', 'qwerz', 'ertz', 'tzui', 'zuio',

            // ========== FILAS AZERTY (FRANCIA) ==========
            'azertyuiop', 'azertyuio', 'azertyui', 'azertyu', 'azerty', 'zertyuiop', 'zertyuio', 'zertyui', 'zertyu', 'zerty',
            'ertyuiop', 'ertyuio', 'ertyui', 'ertyu', 'erty', 'rtyuiop', 'rtyuio', 'rtyui', 'rtyu',
            'qsdfghjklm', 'qsdfghjkl', 'qsdfghjk', 'qsdfghj', 'qsdfgh', 'sdfghjklm', 'sdfghjkl', 'sdfghjk', 'sdfghj',
            'wxcvbn', 'wxcvb', 'wxcv', 'wxc', 'xcvbn', 'xcvb', 'xcv', 'cvbn', 'cvb', 'vbn',
            'azert', 'qsd', 'azer', 'qsdf', 'wert', 'sdfg', 'xcvb', 'dfgh', 'cvbn', 'fghj',

            // ========== PATRONES DIAGONALES ULTRA EXPANDIDOS ==========
            'qaz', 'qsz', 'qxc', 'qdv', 'qfb', 'qgn', 'qhm', 'qjn', 'qkm', 'ql', 'qa', 'qz', 'qw', 'qe', 'qr', 'qt', 'qy', 'qu', 'qi', 'qo', 'qp',
            'wsx', 'wdc', 'wev', 'wrb', 'wtg', 'wyh', 'wun', 'wij', 'wok', 'wpl', 'ws', 'wx', 'wa', 'wd', 'wf', 'wg', 'wh', 'wj', 'wk', 'wl',
            'edc', 'edv', 'efb', 'erg', 'eth', 'eyj', 'euk', 'eio', 'eip', 'ed', 'ec', 'er', 'et', 'ey', 'eu', 'ei', 'eo', 'ep',
            'rfv', 'rgb', 'rth', 'ryj', 'ruk', 'rio', 'rip', 'rf', 'rv', 'rt', 'ry', 'ru', 'ri', 'ro', 'rp',
            'tgb', 'tyh', 'tuj', 'tik', 'tol', 'top', 'tg', 'tb', 'ty', 'tu', 'ti', 'to', 'tp',
            'yhn', 'yuj', 'yik', 'yol', 'yop', 'yh', 'yn', 'yu', 'yi', 'yo', 'yp',
            'ujm', 'uik', 'uol', 'uop', 'uj', 'um', 'ui', 'uo', 'up',
            'ik', 'iol', 'iop', 'ik', 'il', 'io', 'ip',
            'ol', 'op', 'ok', 'ol', 'oi', 'ou', 'oy',
            'p', 'o', 'i', 'u', 'y', 't', 'r', 'e', 'w', 'q', 'l', 'k', 'j', 'h', 'g', 'f', 'd', 's', 'a', 'm', 'n', 'b', 'v', 'c', 'x', 'z',

            // ========== PATRONES EN FORMA DE CRUZ ==========
            'qweasdzxc', 'asdzxc', 'qwezxc', 'qweasd', 'rfvtgb', 'yhnujm', 'yhnujmik', 'ujmikol', 'ikolp',
            'edcrfv', 'rfvtgb', 'tgb', 'yhn', 'ujm', 'ik', 'ol', 'p', 'qaz', 'wsx', 'edc', 'rfv', 'tgb', 'yhn', 'ujm', 'ik', 'ol',
            'plm', 'okn', 'ijm', 'uhn', 'ygb', 'trf', 'edc', 'wsx', 'qaz',

            // ========== PATRONES EN ESPIRAL ==========
            'qazwsxedc', 'wsxedcrfv', 'edcrfvtgb', 'rfvtgbyhn', 'tgbyhnujm', 'yhnujmik', 'ujmikol', 'ikolp',
            'zaqxswcde', 'xswcdevfr', 'cdevfrbgt', 'vfrbgtnhy', 'bgtnhymju', 'nhymjukil', 'ymjukilop', 'jukilop',
            'plokmijnu', 'olkmjinuh', 'lkmjinuhb', 'kmjinuhby', 'mjinuhbyg', 'jinuhbygt', 'inuhbygtf', 'nuhbygtfc',

            // ========== PATRONES VERTICALES ==========
            'qaz', 'wsx', 'edc', 'rfv', 'tgb', 'yhn', 'ujm', 'ik', 'ol', 'p',
            'aqz', 'swx', 'dec', 'frv', 'gtb', 'hyn', 'jum', 'kil', 'lop',
            'zaq', 'xsw', 'cde', 'vfr', 'bgt', 'nhy', 'mju', 'lik', 'pol',
            'qwa', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
            'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl',
            'zxc', 'xcv', 'cvb', 'vbn', 'bnm',

            // ========== PATRONES EN ZIG-ZAG ==========
            'qsedftgyhujikolp', 'azsxdcfvgbhnjmk', 'qazxswedcvfrbgt', 'plokmijnuhbygvt', 'mnbvcxzasdfghjkl', 'qwertasdfgzxcvb',
            'qawsexdrcftvgybhunjimkol', 'zsxcdvfbghnjmk', 'qaszxswedcvfrbgt', 'plokmijnuhbygvtfcdexsw',
            'qaswedrfytguh', 'wsxedrfvtgbyhn', 'edcrfvtgbyhnujm', 'rfvtgbyhnujmikol',

            // ========== PATRONES CIRCULARES ==========
            'qazplokm', 'wsxokmji', 'edcmjunh', 'rfvujmik', 'qpalz', 'woskx', 'edmjc', 'rfvui',
            'plmkozaq', 'oknjiwsx', 'ijmhuedc', 'uhngbyrfv', 'ygbtfr', 'trfced', 'edcxs', 'wsxza',
            'qazxswcdevfrbgtnhymjukilop', 'plokmijnuhbygvtfcdexswzaq',

            // ========== PATRONES DE TECLADO NUMÉRICO ==========
            '1234567890', '123456789', '234567890', '12345678', '23456789', '34567890', '4567890', '567890', '67890', '7890', '890', '90', '0',
            '0987654321', '098765432', '987654321', '09876543', '98765432', '87654321', '76543210', '6543210', '543210', '43210', '3210', '210', '10',
            '147', '258', '369', '456', '789', '159', '357', '951', '753', '852', '741', '963',
            'qwe123', 'asd456', 'zxc789', 'rty456', 'fgh789', 'vbn123', 'yui456', 'jkl789', 'nm123',
            '123qwe', '456asd', '789zxc', '456rty', '789fgh', '123vbn', '456yui', '789jkl', '123nm',

            // ========== PATRONES DE FILAS SUPERIORES CON SHIFT ==========
            '!@#$%^&*()', '!@#$%^&*', '@#$%^&*()', '!@#$%^', '@#$%^&', '#$%^&*', '$%^&*', '%^&*', '^&*', '&*', '*',
            'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM', 'POIUYTREWQ', 'LKJHGFDSA', 'MNBVCXZ',
            'QWERTY', 'ASDFGH', 'ZXCVB', 'POIUY', 'LKJHG', 'MNBVC',
            'qWeRtYuIoP', 'aSdFgHjKl', 'zXcVbNm', 'pOiUyTrEwQ', 'lKjHgFdSa', 'mNbVcXz',

            // ========== PATRONES MIXTOS (TECLAS ESPECIALES) ==========
            'q1w2e3r4', 'a1s2d3f4', 'z1x2c3v4', 'qaz123', 'wsx456', 'edc789', 'rty123', 'fgh456', 'vbn789',
            '1qaz', '2wsx', '3edc', '4rfv', '5tgb', '6yhn', '7ujm', '8ik', '9ol', '0p',
            'zaq1', 'xsw2', 'cde3', 'vfr4', 'bgt5', 'nhy6', 'mju7', 'ki8', 'lo9', 'p0',
            'q1a1z1', 'w2s2x2', 'e3d3c3', 'r4f4v4', 't5g5b5', 'y6h6n6', 'u7j7m7', 'i8k8', 'o9l9', 'p0o0',

            // ========== PATRONES DE MOVIMIENTO DEL MOUSE ==========
            'qweasdzxcrfvtgb', 'asdzxcrfvtgbyhn', 'zxcrfvtgbyhnujm', 'qazwsxedcrfvtgb', 'wsxedcrfvtgbyhn', 'edcrfvtgbyhnujm',
            'rfvtgbyhnujmikol', 'tgbyhnujmikolp', 'yhnujmikolp', 'ujmikolp', 'ikolp', 'olp',

            // ========== PATRONES DE SALTO ==========
            'qcegik', 'wdfhjl', 'xegikm', 'cfilor', 'vhmptx', 'bgjosv', 'aeimqu', 'bfjnrv', 'cgkosw', 'dhlptx',
            'qegiko', 'wdfhjl', 'xegikm', 'cfilor', 'vhmptx', 'bgjosv', 'aeimqu', 'bfjnrv', 'cgkosw', 'dhlptx',
            'acegikmoqsuwy', 'bdfhjlnprtvxz', 'adgjmpsvy', 'behknqtwz', 'cfilorux',

            // ========== PATRONES SIMÉTRICOS ==========
            'qwertytrewq', 'asdfgfdsa', 'zxcvbvcxz', 'poiuytrewqwertyuiop', 'qazzaq', 'wsxxsw', 'edccde', 'rfvvfr', 'tgbvgt', 'yhnyhn',
            'plokmij', 'uhbygvt', 'fcdexsw', 'zaqplm', 'oknjiw', 'sxedcr', 'fvbgty', 'hnmju', 'ikolp',
            'qqwweerrttyy', 'aassddffgghh', 'zzxxccvvbbnn', 'ppooiiuuyytt',

            // ========== PATRONES DE REPETICIÓN ==========
            'qweqwe', 'asdasd', 'zxczxc', 'rtyrty', 'fghfgh', 'vbnvbn', 'qazqaz', 'wsxwsx', 'edcedc', 'rfvrfv', 'tgbtgb', 'yhnyhn',
            'qweqweqwe', 'asdasdasd', 'zxczxczxc', 'rtyrtyrty', 'fghfghfgh', 'vbnvbnvbn',
            'qqwwee', 'aassdd', 'zzxxcc', 'rrttyy', 'ffgghh', 'vvbbnn',

            // ========== PATRONES DE ONDA ==========
            'qaswedrf', 'wedrfytg', 'edrfytguh', 'wsxdrfvtg', 'edcvfrbgt', 'qaswedrfytguh', 'wsxdrfvtgbyhn', 'edcvfrbgtnhymj',
            'rfvtgbyhnujmikol', 'tgbyhnujmikolp', 'yhnujmikolp', 'ujmikolp', 'ikolp', 'olp',
            'plokmijnuhbygvtfcdexswzaq', 'mnbvcxzasdfghjklqwertyuiop',

            // ========== PATRONES ADICIONALES EXPANDIDOS ==========
            'qawsedrftgyhujikolp', 'azsxdcfvgbhnjmk', 'qazxswedcvfrbgtnhymjuk',
            'plokmijnuhbygvtfcdexswzaq', 'mnbvcxzasdfghjklqwertyuiop',
            '1q2w3e4r5t6y7u8i9o0p', '1a2s3d4f5g6h7j8k9l', '1z2x3c4v5b6n7m',
            'q1a1z1w2s2x2e3d3c3', 'r4f4v4t5g5b5y6h6n6', 'u7j7m7i8k8o9l9p0o0',
            'abcdefghijklmnopqrstuvwxyz1234567890', '1234567890abcdefghijklmnopqrstuvwxyz',
            'qwertyuiop1234567890', 'asdfghjkl1234567890', 'zxcvbnm1234567890',
            '!@#$%^&*()qwertyuiop', '!@#$%^&*()asdfghjkl', '!@#$%^&*()zxcvbnm',
            'qazwsxedcrfvtgbyhnujmikolp1234567890', '1234567890qazwsxedcrfvtgbyhnujmikolp',
            'qwe123rty456fgh789vbn123', 'asd456fgh789jkl012zxc789',
            'zaq1xsw2cde3vfr4bgt5nhy6mju7ki8lo9p0', '1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0p',
            'plmkoijnuhbygvtrfcedxswzaq', 'mnbvcxzlkjhgfdsapoiuytrewq',
            'qwertyuiopasdfghjklzxcvbnmqwertyuiop', 'asdfghjklzxcvbnmqwertyuiopasdfghjkl',
            'zxcvbnmqwertyuiopasdfghjklzxcvbnm', 'poiuytrewqlkjhgfdsamnbvcxzpoiuytrewq',
            'lkjhgfdsamnbvcxzpoiuytrewqlkjhgfdsa', 'mnbvcxzpoiuytrewqlkjhgfdsamnbvcxz'
        ];

        // ========== SECUENCIAS ALFABÉTICAS MEGA EXPANDIDAS ==========
        this.sequencePatterns = [
            // ========== ASCENDENTES COMPLETAS Y PARCIALES ==========
            'abcdefghijklmnopqrstuvwxyz', 'abcdefghijklm', 'nopqrstuvwxyz', 'abcdefgh', 'bcdefghi', 'cdefghij', 'defghijk', 'efghijkl', 'fghijklm',
            'ghijklmn', 'hijklmno', 'ijklmnop', 'jklmnopq', 'klmnopqr', 'lmnopqrs', 'mnopqrst', 'nopqrstu', 'opqrstuv', 'pqrstuvw', 'qrstuvwx', 'rstuvwxy',
            'stuvwxyz', 'tuvwxyz', 'uvwxyz', 'vwxyz', 'wxyz', 'xyz', 'yz', 'z', 'abcdef', 'bcdefg', 'cdefgh', 'defghi', 'efghij', 'fghijk', 'ghijkl',
            'hijklm', 'ijklmn', 'jklmno', 'klmnop', 'lmnopq', 'mnopqr', 'nopqrs', 'opqrst', 'pqrstu', 'qrstuv', 'rstuvw', 'stuvwx', 'tuvwxy', 'uvwxyz',

            // ========== DESCENDENTES COMPLETAS Y PARCIALES ==========
            'zyxwvutsrqponmlkjihgfedcba', 'zyxwvutsrqpon', 'mlkjihgfedcba', 'zyxwv', 'yxwvu', 'xwvut', 'wvuts', 'vutsr', 'utsrq', 'tsrqp',
            'srqpo', 'rqpon', 'qponm', 'ponml', 'onmlk', 'nmlkj', 'mlkji', 'lkjih', 'kjihg', 'jihgf', 'ihgfe', 'hgfed', 'gfedc', 'fedcb',
            'edcba', 'dcba', 'cba', 'ba', 'a', 'zyxw', 'yxwv', 'xwvu', 'wvut', 'vuts', 'utsr', 'tsrq', 'srqp', 'rqpo', 'qpon', 'ponm', 'onml',
            'nmlk', 'mlkj', 'lkji', 'kjih', 'jihg', 'ihgf', 'hgfe', 'gfed', 'fedc', 'edcb', 'dcba',

            // ========== SECUENCIAS SALTADAS ==========
            'acegikmoqsuwy', 'bdfhjlnprtvxz', 'adgjmpsvy', 'behknqtwz', 'cfilorux', 'abcabc', 'defdef', 'ghighi', 'jkljkl', 'mnopmnop', 'qrsqrs', 'tuvtuv', 'wxyzwxyz',
            'aceg', 'bdfh', 'cegi', 'dfhj', 'egik', 'fhjl', 'gikm', 'hjln', 'ikmo', 'jlnp', 'kmoq', 'lnpr', 'moqs', 'nprt', 'oqsu', 'prtv', 'qsuw', 'rtvx', 'suwy', 'tvxz',
            'adgj', 'behk', 'cfil', 'dgjm', 'ehkn', 'filo', 'gjmps', 'hknqt', 'ilorux', 'jmpsvy', 'knqtwz', 'lorux', 'mpsvy', 'nqtwz', 'orux', 'psvy', 'qtwz', 'rux', 'svy', 'twz', 'ux', 'vy', 'wz',

            // ========== SECUENCIAS REPETITIVAS ==========
            'abcabc', 'abcdabcd', 'abcdeabcde', 'abcdefabcdef', 'xyzxyz', 'wxyzwxyz', 'vwxyzvwxyz', 'uvwxyzuvwxyz',
            'abcabcabc', 'abcdabcdabcd', 'abcdeabcdeabcde', 'abcdefabcdefabcdef',
            'xyzxyzxyz', 'wxyzwxyzwxyz', 'vwxyzvwxyzvwxyz', 'uvwxyzuvwxyzuvwxyz',
            'qweqwe', 'asdasd', 'zxczxc', 'rtyrty', 'fghfgh', 'vbnvbn', 'qazqaz', 'wsxwsx', 'edcedc', 'rfvrfv',

            // ========== SECUENCIAS NUMÉRICAS ==========
            '0123456789', '1234567890', '012345678', '123456789', '234567890', '9876543210', '0987654321', '987654321', '876543210', '765432109',
            '1112131415', '2122232425', '3132333435', '4142434445', '5152535455', '1020304050', '1121314151', '1222324252', '1323334353', '1424344454',
            '01234', '12345', '23456', '34567', '45678', '56789', '67890', '78901', '89012', '90123',
            '09876', '98765', '87654', '76543', '65432', '54321', '43210', '32109', '21098', '10987',
            '13579', '24680', '159263748', '123123', '456456', '789789', '123456123456', '654321654321',

            // ========== SECUENCIAS ALFANUMÉRICAS ==========
            'a1b2c3d4', 'e5f6g7h8', 'i9j0k1l2', 'm3n4o5p6', 'q7r8s9t0', '1a2b3c4d', '5e6f7g8h', '9i0j1k2l', '3m4n5o6p', '7q8r9s0t',
            'abc123', 'def456', 'ghi789', 'jkl012', 'mno345', 'pqr678', 'stu901', 'vwx234', 'yz567', 'abc456', 'def789', 'ghi012', 'jkl345', 'mno678', 'pqr901',
            '123abc', '456def', '789ghi', '012jkl', '345mno', '678pqr', '901stu', '234vwx', '567yz', '456abc', '789def', '012ghi', '345jkl', '678mno', '901pqr',
            'q1w2e3', 'r4t5y6', 'u7i8o9', 'p0a1b2', 'c3d4e5', 'f6g7h8', 'i9j0k1', 'l2m3n4', 'o5p6q7', 'r8s9t0',

            // ========== SECUENCIAS DE TECLADO ALTERNATIVO ==========
            'qaywsxed', 'rfvtgbyh', 'nujmikol', 'pzaqxswc', 'devfrbgt', 'qwedfrtg', 'yhuijklo', 'pasdfghj', 'klzxcvbn', 'mqwertyu',
            'qawsedrftgyh', 'azsxdcfvgbhn', 'qazxswedcvfr', 'plokmijnuhby', 'mnbvcxzasdfg',
            'qwertasdfgzxcvb', 'poiuylkjhmnbvc', 'qazwsxedcrfvtgb', 'plokmijnuhbygvt',
            'qwe123asd456zxc789', 'rty456fgh789vbn123', 'yui456jkl789nm123',

            // ========== SECUENCIAS MIXTAS LARGAS ==========
            'q1w2e3r4t5y6u7i8o9p0', 'a1s2d3f4g5h6j7k8l9', 'z1x2c3v4b5n6m7', '1q2w3e4r5t6y7u8i9o0p', '1a2s3d4f5g6h7j8k9l', '1z2x3c4v5b6n7m',
            'q1a1z1w2s2x2e3d3c3r4f4v4t5g5b5y6h6n6u7j7m7i8k8o9l9p0o0',
            'abcdefghijklmnopqrstuvwxyz1234567890', '1234567890abcdefghijklmnopqrstuvwxyz',
            'qwertyuiopasdfghjklzxcvbnm1234567890', '1234567890qwertyuiopasdfghjklzxcvbnm',
            '!@#$%^&*()qwertyuiopasdfghjklzxcvbnm', 'qwertyuiopasdfghjklzxcvbnm!@#$%^&*()',

            // ========== SECUENCIAS PATRÓN 3-3-3 ==========
            'qweasdzxc', 'rtyfghvbn', 'yuihjknm', 'iopjkl', 'asdzxcqwe', 'fghvbnrty', 'hjknmyui', 'jklop',
            'qweasdzxcqwe', 'rtyfghvbnrty', 'yuihjknmyui', 'iopjkliop',
            'asdzxcqweasd', 'fghvbnrtyfgh', 'hjknmyuihjk', 'jklopjkl',
            'qwe123asd456zxc789', 'rty456fgh789vbn123', 'yui456jkl789nm123',

            // ========== SECUENCIAS EN ESPIRAL NUMÉRICA ==========
            '159357', '258456', '369654', '147896', '1236987', '9874123', '654789', '321456', '987123', '456789',
            '159753', '258654', '369963', '147741', '258852', '369963', '741147', '852258', '963369',
            '123321', '456654', '789987', '147741', '258852', '369963', '159951', '357753',
            '112233445566778899', '998877665544332211', '12233445566778899', '99887766554433221',

            // ========== SECUENCIAS DE REPETICIÓN MÚLTIPLE ==========
            'qweqweqwe', 'asdasdasd', 'zxczxczxc', 'rtyrtyrty', 'fghfghfgh', 'qazqazqaz', 'wsxwsxwsx', 'edcedcedc', 'rfvrfvrfv', 'tgbtgbtgb',
            'qweqweqweqwe', 'asdasdasdasd', 'zxczxczxczxc', 'rtyrtyrtyrty', 'fghfghfghfgh',
            'qazqazqazqaz', 'wsxwsxwsxwsx', 'edcedcedcedc', 'rfvrfvrfvrfv', 'tgbtgbtgbtgb',
            'abcabcabcabc', 'defdefdefdef', 'ghighighighi', 'jkljkljkljkl', 'mnopmnopmnopmnop',

            // ========== SECUENCIAS DE ONDA COMPLEJA ==========
            'qaswedrfytguh', 'wsxedrfvtgbyhn', 'edcrfvtgbyhnujm', 'rfvtgbyhnujmikol', 'tgbyhnujmikolp',
            'qaswedrfytguhijokpl', 'wsxedrfvtgbyhnujmik', 'edcrfvtgbyhnujmikolp',
            'rfvtgbyhnujmikolpqaz', 'tgbyhnujmikolpqazwsx',
            'plokmijnuhbygvtfcdexswzaq', 'mnbvcxzasdfghjklqwertyuiop',

            // ========== SECUENCIAS MIRROR ==========
            'qwertytrewq', 'asdfgfdsa', 'zxcvbvcxz', 'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz', 'qazzaq', 'wsxxsw',
            'edccde', 'rfvvfr', 'tgbvgt', 'yhnyhn', 'ujmmju', 'ikkli', 'ollpo', 'p',
            'qwertyuiopoiuytrewq', 'asdfghjklkjhgfdsa', 'zxcvbnmmnbvcxz',
            'qazwsxedcrfvtgbyhnujmikolpplokmijnuhbygvtfcdexswzaq',

            // ========== SECUENCIAS DE PATRÓN CUADRADO ==========
            'qasw', 'wedr', 'edrf', 'rftg', 'tgby', 'ybhn', 'hnuj', 'ujmi', 'miko', 'ikol',
            'wsxd', 'sxed', 'xedc', 'edcv', 'dcvf', 'cvfr', 'vfrb', 'frbg', 'rbgt', 'bgtn',
            'qaswwedr', 'wedredrf', 'edrfrftg', 'rftgtgby', 'tgbyybhn', 'ybhnhnuj', 'hnujujmi', 'ujmimiko', 'mikoikol',
            'wsxdsxed', 'sxedxedc', 'xedcedcv', 'edcvdcvf', 'dcvfcvfr', 'cvfrvfrb', 'vfrbfrbg', 'frbgrbgt', 'rbgtbgtn',

            // ========== SECUENCIAS DE TECLADO EXTENDIDO ==========
            'qwertyuiopasdfghjklzxcvbnm', 'poiuytrewqlkjhgfdsamnbvcxz',
            'qazwsxedcrfvtgbyhnujmikolp', 'plokmijnuhbygvtfcdexswzaq',
            'qwertyuiopasdfghjklzxcvbnmqwertyuiop', 'asdfghjklzxcvbnmqwertyuiopasdfghjkl',
            'zxcvbnmqwertyuiopasdfghjklzxcvbnm', 'poiuytrewqlkjhgfdsamnbvcxzpoiuytrewq',
            'lkjhgfdsamnbvcxzpoiuytrewqlkjhgfdsa', 'mnbvcxzpoiuytrewqlkjhgfdsamnbvcxz',

            // ========== SECUENCIAS DE SALTO DOBLE ==========
            'acegikmoqsuwybdfh', 'bdfhjlnprtvxzaceg', 'adgjmpsvybehkn', 'behknqtwzcfilor', 'cfiloruxadgjm',
            'acegikmoqsuwybdfhjlnprtvxz', 'bdfhjlnprtvxzacegikmoqsuwy',
            'adgjmpsvybehknqtwzcfilorux', 'behknqtwzcfiloruxadgjmpsvy',
            'cfiloruxadgjmpsvybehknqtwz', 'dgknqtwzbehloruxcfimpsy',

            // ========== SECUENCIAS DE PATRÓN ESTRELLA ==========
            'qdz', 'wex', 'edc', 'rfv', 'tgb', 'yhn', 'ujm', 'ikm', 'oln', 'pkm',
            'azq', 'sxw', 'dce', 'fvr', 'gbt', 'hny', 'jmu', 'kmi', 'lno', 'pom',
            'qdzwex', 'wexedc', 'edcrfv', 'rfvtgb', 'tgbyhn', 'yhnujm', 'ujmikm', 'ikmoln', 'olnpkm',
            'azqsxw', 'sxwdce', 'dcefvr', 'fvrgbt', 'gbthny', 'hnyjmu', 'jmukmi', 'kmilno', 'lnopom',

            // ========== SECUENCIAS DE REPETICIÓN PROGRESIVA ==========
            'qqww', 'wwee', 'eerr', 'rrtt', 'ttyy', 'yyuu', 'uuii', 'iioo', 'oopp',
            'aass', 'ssdd', 'ddff', 'ffgg', 'gghh', 'hhjj', 'jjkk', 'kkll',
            'zzxx', 'xxcc', 'ccvv', 'vvbb', 'bbnn', 'nnmm',
            'qqwwww', 'wweeee', 'eerrrr', 'rrtttt', 'ttyyyy', 'yyuuuu', 'uuiiii', 'iioooo', 'oopppp',
            'aassss', 'ssdddd', 'ddffff', 'ffgggg', 'gghhhh', 'hhjjjj', 'jjkkkk', 'kkllll',

            // ========== SECUENCIAS DE ONDA INVERSA ==========
            'plokmijnuhbygvt', 'olpkmjiunhbygv', 'koplimjunhbygt', 'mnbvcxzasdfghjk', 'nbvcxzmasdfghj', 'vcxzbnamdfghk',
            'plokmijnuhbygvtfcdexswzaq', 'olpkmjiunhbygvtfcdexswza', 'koplimjunhbygvtfcdexswz',
            'mnbvcxzasdfghjklqwertyuiop', 'nbvcxzmasdfghjklqwertyuio', 'vcxzbnamdfghjklqwertyui',

            // ========== SECUENCIAS DE PATRÓN DIAMANTE ==========
            'qaswedrfytguhij', 'wsxedrfvtgbyhni', 'edcrfvtgbyhnujm', 'rfvtgbyhnujmiko', 'tgbyhnujmikolp',
            'qaswedrfytguhijokpl', 'wsxedrfvtgbyhnujmikol', 'edcrfvtgbyhnujmikolp',
            'rfvtgbyhnujmikolpqaz', 'tgbyhnujmikolpqazwsxedc',
            'plokmijnuhbygvtfcdexswzaq', 'mnbvcxzasdfghjklqwertyuiop',

            // ========== SECUENCIAS DE TECLADO COMPLETO ==========
            'qwertyuiopasdfghjklzxcvbnmqwertyuiop', 'asdfghjklzxcvbnmqwertyuiopasdfghjkl',
            'zxcvbnmqwertyuiopasdfghjklzxcvbnm', 'poiuytrewqlkjhgfdsamnbvcxzpoiuytrewq',
            'lkjhgfdsamnbvcxzpoiuytrewqlkjhgfdsa', 'mnbvcxzpoiuytrewqlkjhgfdsamnbvcxz',
            'qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnm',
            'poiuytrewqlkjhgfdsamnbvcxzpoiuytrewqlkjhgfdsamnbvcxz',

            // ========== SECUENCIAS DE REPETICIÓN MIXTA ==========
            'q1a1z1', 'w2s2x2', 'e3d3c3', 'r4f4v4', 't5g5b5', 'y6h6n6', 'u7j7m7', 'i8k8', 'o9l9', 'p0o0',
            'q1a1z1w2s2x2', 'e3d3c3r4f4v4', 't5g5b5y6h6n6', 'u7j7m7i8k8o9l9p0o0',
            '1q1a1z1', '2w2s2x2', '3e3d3c3', '4r4f4v4', '5t5g5b5', '6y6h6n6', '7u7j7m7', '8i8k8', '9o9l9', '0p0o0',

            // ========== SECUENCIAS DE PATRÓN SERPENTEANTE ==========
            'qawsedrftgyhujikolp', 'azsxdcfvgbhnjmk', 'qazxswedcvfrbgtnhymjuk',
            'plokmijnuhbygvtfcdexswzaq', 'mnbvcxzasdfghjklqwertyuiop',
            'qawsedrftgyhujikolpzaqxswcdevfrbgt', 'azsxdcfvgbhnjmkqwertyuiop',
            'qazxswedcvfrbgtnhymjukilopplokmijn', 'plokmijnuhbygvtfcdexswzaqwerty',
            'mnbvcxzasdfghjklqwertyuioppoiuytrewq'
        ];

        // ========== PATRONES ADICIONALES ESPECIALES ==========
        this.specialPatterns = [
            // Patrones de fecha comunes
            '01011970', '12311999', '01012000', '12312000', '01012001',
            '12121980', '11111911', '07041976', '25091982', '31121999',

            // Patrones de código común
            '112233', '445566', '778899', '123123', '321321',
            '111222', '333444', '555666', '777888', '999000',

            // Patrones de teclado por columnas
            'qazplm', 'wsxokn', 'edcijm', 'rfvuhb', 'tgbygv',
            'zaqlpm', 'xsowkn', 'cdeijm', 'vfrubh', 'bgtgyv'
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

        // ========== PATRONES REPETITIVOS ==========
        this.repetitionPatterns = [
            'jaja', 'jaj', 'jajaja', 'jajaj', 'jajajaja', 'jajajaj', 'jajajajaja', 'jajajajaj',
            'jeje', 'jej', 'jejeje', 'jejej', 'jejejeje', 'jejejej', 'jejejejeje', 'jejejejej',
            'jiji', 'jij', 'jijiji', 'jijij', 'jijijiji', 'jijijij', 'jijijijiji', 'jijijijij',
            'jojo', 'joj', 'jojojo', 'jojoj', 'jojojojo', 'jojojoj', 'jojojojojo', 'jojojojoj',
            'juju', 'juj', 'jujuju', 'jujuj', 'jujujuju', 'jujujuj', 'jujujujuju', 'jujujujuj',

            // ========== PATRONES CON L - TODAS LAS COMBINACIONES ==========
            'lala', 'lal', 'lalala', 'lalal', 'lalalala', 'lalalal', 'lalalalala', 'lalalalal',
            'lele', 'lel', 'lelele', 'lelel', 'lelelele', 'lelelel', 'lelelelele', 'lelelelel',
            'lili', 'lil', 'lilili', 'lilil', 'lililili', 'lililil', 'lilililili', 'lilililil',
            'lolo', 'lol', 'lololo', 'lolol', 'lolololo', 'lololol', 'lololololo', 'lolololol',
            'lulu', 'lul', 'lululu', 'lulul', 'lulululu', 'lululul', 'lululululu', 'lulululul',

            // ========== PATRONES CON N - TODAS LAS COMBINACIONES ==========
            'nana', 'nan', 'nanana', 'nanan', 'nananana', 'nananan', 'nanananana', 'nanananan',
            'nene', 'nen', 'nenene', 'nenen', 'nenenene', 'nenenen', 'nenenenene', 'nenenenen',
            'nini', 'nin', 'ninini', 'ninin', 'nininini', 'nininin', 'ninininini', 'ninininin',
            'nono', 'non', 'nonono', 'nonon', 'nononono', 'nononon', 'nonononono', 'nonononon',
            'nunu', 'nun', 'nununu', 'nunun', 'nunununu', 'nununun', 'nununununu', 'nunununun',

            // ========== PATRONES CON M - TODAS LAS COMBINACIONES ==========
            'mama', 'mam', 'mamama', 'mamam', 'mamamama', 'mamamam', 'mamamamama', 'mamamamam',
            'meme', 'mem', 'mememe', 'memem', 'memememe', 'mememem', 'mememememe', 'memememem',
            'mimi', 'mim', 'mimimi', 'mimim', 'mimimimi', 'mimimim', 'mimimimimi', 'mimimimim',
            'momo', 'mom', 'momomo', 'momom', 'momomomo', 'momomom', 'momomomomo', 'momomomom',
            'mumu', 'mum', 'mumumu', 'mumum', 'mumumumu', 'mumumum', 'mumumumumu', 'mumumumum',

            // ========== PATRONES CON P - TODAS LAS COMBINACIONES ==========
            'papa', 'pap', 'papapa', 'papap', 'papapapa', 'papapap', 'papapapapa', 'papapapap',
            'pepe', 'pep', 'pepepe', 'pepep', 'pepepepe', 'pepepep', 'pepepepepe', 'pepepepep',
            'pipi', 'pip', 'pipipi', 'pipip', 'pipipipi', 'pipipip', 'pipipipipi', 'pipipipip',
            'popo', 'pop', 'popopo', 'popop', 'popopopo', 'popopop', 'popopopopo', 'popopopop',
            'pupu', 'pup', 'pupupu', 'pupup', 'pupupupu', 'pupupup', 'pupupupupu', 'pupupupup',

            // ========== PATRONES CON T - TODAS LAS COMBINACIONES ==========
            'tata', 'tat', 'tatata', 'tatat', 'tatatata', 'tatatat', 'tatatatata', 'tatatatat',
            'tete', 'tet', 'tetete', 'tetet', 'tetetete', 'tetetet', 'tetetetete', 'tetetetet',
            'titi', 'tit', 'tititi', 'titit', 'titititi', 'tititit', 'tititititi', 'titititit',
            'toto', 'tot', 'tototo', 'totot', 'totototo', 'tototot', 'tototototo', 'totototot',
            'tutu', 'tut', 'tututu', 'tutut', 'tutututu', 'tututut', 'tututututu', 'tutututut',

            // ========== PATRONES CON B - TODAS LAS COMBINACIONES ==========
            'baba', 'bab', 'bababa', 'babab', 'babababa', 'bababab', 'bababababa', 'babababab',
            'bebe', 'beb', 'bebebe', 'bebeb', 'bebebebe', 'bebebeb', 'bebebebebe', 'bebebebeb',
            'bibi', 'bib', 'bibibi', 'bibib', 'bibibibi', 'bibibib', 'bibibibibi', 'bibibibib',
            'bobo', 'bob', 'bobobo', 'bobob', 'bobobobo', 'bobobob', 'bobobobobo', 'bobobobob',
            'bubu', 'bub', 'bububu', 'bubub', 'bubububu', 'bububub', 'bububububu', 'bubububub',

            // ========== PATRONES CON D - TODAS LAS COMBINACIONES ==========
            'dada', 'dad', 'dadada', 'dadad', 'dadadada', 'dadadad', 'dadadadada', 'dadadadad',
            'dede', 'ded', 'dedede', 'deded', 'dededede', 'dededed', 'dedededede', 'dedededed',
            'didi', 'did', 'dididi', 'didid', 'didididi', 'dididid', 'dididididi', 'didididid',
            'dodo', 'dod', 'dododo', 'dodod', 'dodododo', 'dododod', 'dododododo', 'dodododod',
            'dudu', 'dud', 'dududu', 'dudud', 'dudududu', 'dududud', 'dududududu', 'dudududud',

            // ========== PATRONES CON F - TODAS LAS COMBINACIONES ==========
            'fafa', 'faf', 'fafafa', 'fafaf', 'fafafafa', 'fafafaf', 'fafafafafa', 'fafafafaf',
            'fefe', 'fef', 'fefefe', 'fefef', 'fefefefe', 'fefefef', 'fefefefefe', 'fefefefef',
            'fifi', 'fif', 'fififi', 'fifif', 'fifififi', 'fififif', 'fififififi', 'fifififif',
            'fofo', 'fof', 'fofofo', 'fofof', 'fofofofo', 'fofofof', 'fofofofofo', 'fofofofof',
            'fufu', 'fuf', 'fufufu', 'fufuf', 'fufufufu', 'fufufuf', 'fufufufufu', 'fufufufuf',

            // ========== PATRONES CON G - TODAS LAS COMBINACIONES ==========
            'gaga', 'gag', 'gagaga', 'gagag', 'gagagaga', 'gagagag', 'gagagagaga', 'gagagagag',
            'gege', 'geg', 'gegege', 'gegeg', 'gegegege', 'gegegeg', 'gegegegege', 'gegegegeg',
            'gigi', 'gig', 'gigigi', 'gigig', 'gigigigi', 'gigigig', 'gigigigigi', 'gigigigig',
            'gogo', 'gog', 'gogogo', 'gogog', 'gogogogo', 'gogogog', 'gogogogogo', 'gogogogog',
            'gugu', 'gug', 'gugugu', 'gugug', 'gugugugu', 'gugugug', 'gugugugugu', 'gugugugug',

            // ========== PATRONES CON H - TODAS LAS COMBINACIONES ==========
            'haha', 'hah', 'hahaha', 'hahah', 'hahahaha', 'hahahah', 'hahahahaha', 'hahahahah',
            'hehe', 'heh', 'hehehe', 'heheh', 'hehehehe', 'heheheh', 'hehehehehe', 'heheheheh',
            'hihi', 'hih', 'hihihi', 'hihih', 'hihihihi', 'hihihih', 'hihihihihi', 'hihihihih',
            'hoho', 'hoh', 'hohoho', 'hohoh', 'hohohoho', 'hohohoh', 'hohohohoho', 'hohohohoh',
            'huhu', 'huh', 'huhuhu', 'huhuh', 'huhuhuhu', 'huhuhuh', 'huhuhuhuhu', 'huhuhuhuh',

            // ========== PATRONES CON K - TODAS LAS COMBINACIONES ==========
            'kaka', 'kak', 'kakaka', 'kakak', 'kakakaka', 'kakakak', 'kakakakaka', 'kakakakak',
            'keke', 'kek', 'kekeke', 'kekek', 'kekekeke', 'kekekek', 'kekekekeke', 'kekekekek',
            'kiki', 'kik', 'kikiki', 'kikik', 'kikikiki', 'kikikik', 'kikikikiki', 'kikikikik',
            'koko', 'kok', 'kokoko', 'kokok', 'kokokoko', 'kokokok', 'kokokokoko', 'kokokokok',
            'kuku', 'kuk', 'kukuku', 'kukuk', 'kukukuku', 'kukukuk', 'kukukukuku', 'kukukukuk',

            // ========== PATRONES CON R - TODAS LAS COMBINACIONES ==========
            'rara', 'rar', 'rarara', 'rarar', 'rararara', 'rararar', 'rarararara', 'rarararar',
            'rere', 'rer', 'rerere', 'rerer', 'rererere', 'rererer', 'rerererere', 'rerererer',
            'riri', 'rir', 'ririri', 'ririr', 'riririri', 'riririr', 'ririririri', 'ririririr',
            'roro', 'ror', 'rororo', 'roror', 'rorororo', 'rororor', 'rororororo', 'rorororor',
            'ruru', 'rur', 'rururu', 'rurur', 'rurururu', 'rururur', 'rururururu', 'rurururur',

            // ========== PATRONES CON S - TODAS LAS COMBINACIONES ==========
            'sasa', 'sas', 'sasasa', 'sasas', 'sasasasa', 'sasasas', 'sasasasasa', 'sasasasas',
            'sese', 'ses', 'sesese', 'seses', 'sesesese', 'seseses', 'sesesesese', 'seseseses',
            'sisi', 'sis', 'sisisi', 'sisis', 'sisisisi', 'sisisis', 'sisisisisi', 'sisisisis',
            'soso', 'sos', 'sososo', 'sosos', 'sosososo', 'sososos', 'sososososo', 'sosososos',
            'susu', 'sus', 'sususu', 'susus', 'susususu', 'sususus', 'sususususu', 'susususus',

            // ========== PATRONES CON W - TODAS LAS COMBINACIONES ==========
            'wawa', 'waw', 'wawawa', 'wawaw', 'wawawawa', 'wawawaw', 'wawawawawa', 'wawawawaw',
            'wewe', 'wew', 'wewewe', 'wewew', 'wewewewe', 'wewewew', 'wewewewewe', 'wewewewew',
            'wiwi', 'wiw', 'wiwiwi', 'wiwiw', 'wiwiwiwi', 'wiwiwiw', 'wiwiwiwiwi', 'wiwiwiwiw',
            'wowo', 'wow', 'wowowo', 'wowow', 'wowowowo', 'wowowow', 'wowowowowo', 'wowowowow',
            'wuwu', 'wuw', 'wuwuwu', 'wuwuw', 'wuwuwuwu', 'wuwuwuw', 'wuwuwuwuwu', 'wuwuwuwuw',

            // ========== PATRONES CON Y - TODAS LAS COMBINACIONES ==========
            'yaya', 'yay', 'yayaya', 'yayay', 'yayayaya', 'yayayay', 'yayayayaya', 'yayayayay',
            'yeye', 'yey', 'yeyeye', 'yeyey', 'yeyeyeye', 'yeyeyey', 'yeyeyeyeye', 'yeyeyeyey',
            'yiyi', 'yiy', 'yiyiyi', 'yiyiy', 'yiyiyiyi', 'yiyiyiy', 'yiyiyiyiyi', 'yiyiyiyiy',
            'yoyo', 'yoy', 'yoyoyo', 'yoyoy', 'yoyoyoyo', 'yoyoyoy', 'yoyoyoyoyo', 'yoyoyoyoy',
            'yuyu', 'yuy', 'yuyuyu', 'yuyuy', 'yuyuyuyu', 'yuyuyuy', 'yuyuyuyuyu', 'yuyuyuyuy',

            // ========== PATRONES CON Z - TODAS LAS COMBINACIONES ==========
            'zaza', 'zaz', 'zazaza', 'zazaz', 'zazazaza', 'zazazaz', 'zazazazaza', 'zazazazaz',
            'zeze', 'zez', 'zezaze', 'zezaz', 'zezazaze', 'zezazaz', 'zezazazaze', 'zezazazaz',
            'zizi', 'ziz', 'zizizi', 'ziziz', 'zizizizi', 'ziziziz', 'zizizizizi', 'ziziziziz',
            'zozo', 'zoz', 'zozozo', 'zozoz', 'zozozozo', 'zozozoz', 'zozozozozo', 'zozozozoz',
            'zuzu', 'zuz', 'zuzuzu', 'zuzuz', 'zuzuzuzu', 'zuzuzuz', 'zuzuzuzuzu', 'zuzuzuzuz',

            // ========== PATRONES MIXTOS REPETITIVOS - TODAS LAS COMBINACIONES ==========
            'abab', 'ababab', 'abababab', 'ababababab',
            'acac', 'acacac', 'acacacac', 'acacacacac',
            'adad', 'adadad', 'adadadad', 'adadadadad',
            'aeae', 'aeaeae', 'aeaeaeae', 'aeaeaeaeae',
            'afaf', 'afafaf', 'afafafaf', 'afafafafaf',
            'agag', 'agagag', 'agagagag', 'agagagagag',
            'ahah', 'ahahah', 'ahahahah', 'ahahahahah',
            'aiai', 'aiaiai', 'aiaiaiai', 'aiaiaiaiai',
            'ajaj', 'ajajaj', 'ajajajaj', 'ajajajajaj',
            'akak', 'akakak', 'akakakak', 'akakakakak',
            'alal', 'alalal', 'alalalal', 'alalalalal',
            'amam', 'amamam', 'amamamam', 'amamamamam',
            'anan', 'ananan', 'anananan', 'ananananan',
            'aoao', 'aoaoao', 'aoaoaoao', 'aoaoaoaoao',
            'apap', 'apapap', 'apapapap', 'apapapapap',
            'aqaq', 'aqaqaq', 'aqaqaqaq', 'aqaqaqaqaq',
            'arar', 'ararar', 'arararar', 'ararararar',
            'asas', 'asasas', 'asasasas', 'asasasasas',
            'atat', 'atatat', 'atatatat', 'atatatatat',
            'auau', 'auauau', 'auauauau', 'auauauauau',
            'avav', 'avavav', 'avavavav', 'avavavavav',
            'awaw', 'awawaw', 'awawawaw', 'awawawawaw',
            'axax', 'axaxax', 'axaxaxax', 'axaxaxaxax',
            'ayay', 'ayayay', 'ayayayay', 'ayayayayay',
            'azaz', 'azazaz', 'azazazaz', 'azazazazaz'
        ];

        // ========== EXPRESIONES REGULARES COMPLETAS ==========
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
            allowedNumberWithUnit: /^[0-9]+(kg|lb|g|ml|l|cm|m)$/i,

            //Detectar patrones repetitivos de 2-3 caracteres
            repetitivePattern: /^(.{2,3})\1+$/i,

            //Detectar alternancia vocal-consonante repetitiva
            vowelConsonantRepeat: /^([aeiou][bcdfghjklmnpqrstvwxyz]){3,}$/i,
            consonantVowelRepeat: /^([bcdfghjklmnpqrstvwxyz][aeiou]){3,}$/i,

            // Detectar secuencias con misma vocal
            sameVowelPattern: /^[bcdfghjklmnpqrstvwxyz]*([aeiou])\1*[bcdfghjklmnpqrstvwxyz]*$/i,

            // Patrones repetitivos generales
            repeatedSequence: /(.{2,})\1{2,}/gi
        };

        this.thresholds = {
            minLength: 2,
            maxKeyboardSequence: 5,
            maxEntropy: 4.2,
            minWordLength: 3,
            maxRepetitionLength: 3 // Máximo 3 repeticiones del mismo patrón
        };

    }

    // ========== MÉTODO PRINCIPAL==========
    isValidText(text, options = {}) {
        const defaults = {
            minLength: 1,
            maxLength: 100,
            strictMode: false,
            rejectRepetitive: true
        };

        const config = { ...defaults, ...options };
        const cleanText = text.trim();

        // Validación básica
        if (!this.basicValidation(cleanText, config)) {
            return false;
        }

        const words = cleanText.split(/\s+/).filter(word => word.length > 0);

        // Verificar estructura de palabras
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

            if (config.rejectRepetitive && this.isRepetitiveWord(cleanWord.toLowerCase())) {
                return false;
            }
        }

        // Para textos muy cortos, validación más simple
        if (cleanText.length <= 3) {
            return true;
        }

        // Ejecutar verificaciones
        const checks = this.runAllChecks(cleanText, words);

        // Evaluar resultados
        return this.evaluateResults(checks, config, cleanText, words);
    }

    // ========== MÉTODO PARA DETECTAR PALABRAS REPETITIVAS ==========
    isRepetitiveWord(word) {
        if (word.length < 4) return false;

        const lowerWord = word.toLowerCase();

        // 1. Verificar contra lista de patrones repetitivos (más inteligente)
        for (let pattern of this.repetitionPatterns) {
            // Solo rechazar si el patrón es significativo en relación al tamaño de la palabra
            if (pattern.length >= 3) {
                // Si la palabra ES el patrón exacto
                if (lowerWord === pattern) {
                    return true;
                }
                // Si el patrón está contenido y es una parte significativa de la palabra
                if (lowerWord.includes(pattern) && pattern.length >= lowerWord.length * 0.6) {
                    return true;
                }
                // Si el patrón se repite dentro de la palabra
                const occurrences = (lowerWord.match(new RegExp(pattern, 'g')) || []).length;
                if (occurrences >= 2 && pattern.length * occurrences >= lowerWord.length * 0.7) {
                    return true;
                }
            }
        }

        // 2. Verificación adicional con regex para patrones muy obvios
        if (/(.)\1{3,}/.test(lowerWord)) { // 4+ del mismo carácter seguido
            return true;
        }

        // 3. Patrón repetitivo muy obvio (ej: "abababab")
        const repetitiveMatch = lowerWord.match(/(.{2,3})\1{2,}/);
        if (repetitiveMatch) {
            const basePattern = repetitiveMatch[1];
            const totalRepetitions = lowerWord.length / basePattern.length;
            if (totalRepetitions >= 3) {
                return true;
            }
        }

        return false;
    }

    // ========== MÉTODO hasRepetitionPatterns ==========
    hasRepetitionPatterns(text) {
        const cleanText = text.toLowerCase().replace(/[^a-z]/g, '');

        if (cleanText.length < 4) return false;

        // 1. Verificar contra lista de patrones
        for (let pattern of this.repetitionPatterns) {
            if (pattern.length >= 3 && cleanText.includes(pattern)) {
                return true;
            }
        }

        // 2. Verificar palabras individuales
        const words = text.split(/\s+/);
        for (let word of words) {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (this.isRepetitiveWord(cleanWord)) {
                return true;
            }
        }

        return false;
    }

    // En basicValidation, actualizar:
    basicValidation(text, config) {
        if (!text || text.length < config.minLength || text.length > config.maxLength) {
            return false;
        }

        // Verificar que las regex existan antes de usarlas
        if (this.regexPatterns.startsWithNumber && this.regexPatterns.startsWithNumber.test(text)) {
            return false;
        }

        if (this.regexPatterns.startsWithSpecial && this.regexPatterns.startsWithSpecial.test(text)) {
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
        const analysis = this.analyzeText(text);
        analysis.suggestions.forEach(suggestion => console.log(`💡 ${suggestion}`));
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

// Crear instancia global
if (typeof window !== 'undefined' && typeof window.patternsDictionary === 'undefined') {
    window.patternsDictionary = new PatternsDictionary();
}

