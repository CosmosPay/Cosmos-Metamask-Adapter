/** Languages the site shows code in: the dApp examples and the demo's JSON results. */
export type CodeLanguage = 'ts' | 'json';

export type TokenKind = 'plain' | 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'type' | 'property';

export type Token = { kind: TokenKind; text: string };

const KEYWORDS = new Set([
  'as',
  'async',
  'await',
  'class',
  'const',
  'default',
  'else',
  'export',
  'extends',
  'false',
  'for',
  'from',
  'function',
  'if',
  'import',
  'in',
  'interface',
  'let',
  'new',
  'null',
  'of',
  'return',
  'this',
  'true',
  'type',
  'typeof',
  'undefined',
]);

/**
 * One alternative per token class, in order: comments, strings, numbers,
 * identifiers, whitespace, then any other single character, so every
 * character of the input lands in exactly one token.
 */
const LEXER =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)|([A-Za-z_$][\w$]*)|(\s+)|([^])/gu;

/**
 * Splits code into colored tokens for the site's examples. A small lexer
 * rather than a highlighting library: the snippets are short TypeScript and
 * JSON, and the same pure function runs in the prerender and in the browser,
 * so both render the same markup.
 */
export function highlight(code: string, language: CodeLanguage): Token[] {
  const raw = [...code.matchAll(LEXER)];
  const isSpace = (index: number) => raw[index]?.[5] !== undefined;
  // The next token that isn't whitespace, for each position: a call's "(" and a JSON key's ":".
  const next: string[] = [];
  for (let index = raw.length - 1, ahead = ''; index >= 0; index -= 1) {
    next[index] = ahead;
    if (!isSpace(index)) ahead = raw[index]![0];
  }

  const tokens: Token[] = [];
  let previous = '';
  raw.forEach(([text, comment, string, number, word], index) => {
    let kind: TokenKind = 'plain';
    if (comment) kind = 'comment';
    else if (string) kind = language === 'json' && next[index] === ':' ? 'property' : 'string';
    else if (number) kind = 'number';
    else if (word) {
      if (KEYWORDS.has(word)) kind = 'keyword';
      // Classes read the same imported and constructed (`new HybridStellarAdapter()`).
      else if (language === 'ts' && /^[A-Z]/u.test(word)) kind = 'type';
      else if (next[index] === '(') kind = 'function';
      else if (previous === '.') kind = 'property';
    }
    if (!isSpace(index)) previous = text;

    // Runs of one kind (plain text and its spaces, mostly) become one token: fewer elements.
    const last = tokens.at(-1);
    if (last?.kind === kind) last.text += text;
    else tokens.push({ kind, text });
  });
  return tokens;
}
