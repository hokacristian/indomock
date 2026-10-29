/**
 * Copy-paste client snippets for a given request.
 * Dart strings use single quotes; `$` is escaped where Dart would interpolate.
 */
import { cleanParams, origin, API_PREFIX } from './api.js';

const dartMap = (params, pad = '    ') => {
  const entries = Object.entries(params);
  if (!entries.length) return '{}';
  return `{\n${entries.map(([k, v]) => `${pad}  '${k}': '${String(v).replace(/'/g, "\\'").replace(/\$/g, '\\$')}',`).join('\n')}\n${pad}}`;
};
const jsObj = (params, indent = '    ') => {
  const entries = Object.entries(params);
  if (!entries.length) return '{}';
  return `{\n${entries.map(([k, v]) => `${indent}${/^[a-z_]\w*$/i.test(k) ? k : `'${k}'`}: ${/^\d+$/.test(String(v)) ? v : `'${String(v).replace(/'/g, "\\'")}'`},`).join('\n')}\n${indent.slice(2)}}`;
};
const pascal = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const SNIPPET_LANGS = [
  { id: 'curl', label: 'cURL' },
  { id: 'dart-http', label: 'Flutter · http' },
  { id: 'dart-dio', label: 'Flutter · Dio' },
  { id: 'react-fetch', label: 'React · fetch' },
  { id: 'react-axios', label: 'React · Axios' },
];

export function buildSnippet(lang, resource, rawParams) {
  const params = cleanParams(rawParams);
  const isCsv = params.format === 'csv';
  const base = `${origin()}${API_PREFIX}`;
  const qs = new URLSearchParams(params).toString();
  const url = `${base}/${resource}${qs ? `?${qs}` : ''}`;
  const fn = `fetch${pascal(resource)}`;
  const host = new URL(base).host;
  const scheme = new URL(base).protocol.replace(':', '');

  switch (lang) {
    case 'curl':
      return `curl -sS "${url}" \\\n  -H "Accept: ${isCsv ? 'text/csv' : 'application/json'}" \\\n  -w "\\nHTTP %{http_code} · %{time_total}s\\n"`;

    case 'dart-http':
      return `// pubspec.yaml → http: ^1.2.0
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<${isCsv ? 'String' : 'List<dynamic>'}> ${fn}() async {
  final uri = Uri.${scheme}(
    '${host}',
    '${API_PREFIX}/${resource}',
    ${dartMap(params)},
  );

  final res = await http
      .get(uri, headers: {'Accept': '${isCsv ? 'text/csv' : 'application/json'}'})
      .timeout(const Duration(seconds: 10));

  if (res.statusCode >= 400) {
    throw Exception('HTTP \${res.statusCode}: \${res.body}');
  }
  ${isCsv ? 'return res.body;' : `final body = jsonDecode(res.body) as Map<String, dynamic>;
  return body['data'] as List<dynamic>;`}
}`;

    case 'dart-dio':
      return `// pubspec.yaml → dio: ^5.4.0
import 'package:dio/dio.dart';

final dio = Dio(BaseOptions(
  baseUrl: '${base}',
  connectTimeout: const Duration(seconds: 5),
  receiveTimeout: const Duration(seconds: 10),
  ${isCsv ? 'responseType: ResponseType.plain,' : 'responseType: ResponseType.json,'}
));

Future<${isCsv ? 'String' : 'List<dynamic>'}> ${fn}() async {
  try {
    final res = await dio.get(
      '/${resource}',
      queryParameters: ${dartMap(params, '      ')},
    );
    return ${isCsv ? 'res.data as String' : "res.data['data'] as List<dynamic>"};
  } on DioException catch (e) {
    if (e.type == DioExceptionType.receiveTimeout) {
      throw Exception('Koneksi lambat, coba lagi.');
    }
    final code = e.response?.statusCode;
    final msg = e.response?.data?['error']?['message'] ?? e.message;
    throw Exception('Request gagal (\$code): \$msg');
  }
}`;

    case 'react-fetch':
      return `import { useEffect, useState } from 'react';

export function use${pascal(resource)}() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    fetch('${url}', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error?.message ?? \`HTTP \${res.status}\`);
        }
        return ${isCsv ? 'res.text()' : 'res.json()'};
      })
      .then((${isCsv ? 'csv' : 'json'}) => setState({ status: 'success', data: ${isCsv ? 'csv' : 'json.data'}, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', data: null, error });
      })
      .finally(() => clearTimeout(timeout));

    return () => controller.abort();
  }, []);

  return state;
}`;

    case 'react-axios':
      return `// npm i axios
import axios from 'axios';

const api = axios.create({
  baseURL: '${base}',
  timeout: 10_000,
});

export async function ${fn}() {
  try {
    const { data } = await api.get('/${resource}', {
      params: ${jsObj(params, '        ')},${isCsv ? "\n      responseType: 'text'," : ''}
    });
    return ${isCsv ? 'data' : 'data.data'};
  } catch (err) {
    if (err.code === 'ECONNABORTED') throw new Error('Request timeout');
    throw new Error(err.response?.data?.error?.message ?? err.message);
  }
}`;

    default:
      return url;
  }
}
