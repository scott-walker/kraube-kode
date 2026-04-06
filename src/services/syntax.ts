import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import kotlin from 'highlight.js/lib/languages/kotlin';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import markdown from 'highlight.js/lib/languages/markdown';
import ruby from 'highlight.js/lib/languages/ruby';
import swift from 'highlight.js/lib/languages/swift';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import lua from 'highlight.js/lib/languages/lua';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import ini from 'highlight.js/lib/languages/ini';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('java', java);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('ini', ini);

const EXT_MAP: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript', mts: 'typescript',
  js: 'javascript', jsx: 'javascript', mjs: 'javascript',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
  java: 'java', kt: 'kotlin', kts: 'kotlin',
  cs: 'csharp', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
  c: 'c', h: 'c',
  css: 'css', scss: 'scss', sass: 'scss',
  html: 'xml', htm: 'xml', xml: 'xml', svg: 'xml',
  json: 'json', yaml: 'yaml', yml: 'yaml',
  sql: 'sql', sh: 'bash', bash: 'bash', zsh: 'bash',
  md: 'markdown', mdx: 'markdown',
  swift: 'swift', lua: 'lua',
  dockerfile: 'dockerfile', toml: 'ini', ini: 'ini', cfg: 'ini',
};

export function langFromFilename(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const name = filename.toLowerCase();
  if (name === 'dockerfile') return 'dockerfile';
  if (name === 'makefile') return 'bash';
  return EXT_MAP[ext];
}

export function highlightCode(code: string, language?: string): string {
  if (language && hljs.getLanguage(language)) {
    return hljs.highlight(code, { language }).value;
  }
  return hljs.highlightAuto(code).value;
}

/** Split highlighted HTML by newlines, properly closing/reopening spans */
export function splitHighlightedLines(html: string): string[] {
  const result: string[] = [];
  let current = '';
  const tagStack: string[] = [];
  let i = 0;

  while (i < html.length) {
    if (html[i] === '\n') {
      for (let j = tagStack.length - 1; j >= 0; j--) current += '</span>';
      result.push(current);
      current = tagStack.join('');
      i++;
    } else if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end === -1) { current += html[i]; i++; continue; }
      const tag = html.slice(i, end + 1);
      if (tag.startsWith('</')) {
        tagStack.pop();
      } else if (!tag.endsWith('/>')) {
        tagStack.push(tag);
      }
      current += tag;
      i = end + 1;
    } else {
      current += html[i];
      i++;
    }
  }
  if (current) result.push(current);

  return result;
}
