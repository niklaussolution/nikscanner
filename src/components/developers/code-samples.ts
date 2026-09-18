export type TokenClass = "kw" | "str" | "fn" | "plain" | "punct" | "num" | "comment" | "danger";

export interface Token {
  t: string;
  c: TokenClass;
}

export type CodeLine = Token[];

export interface LangSample {
  id: "javascript" | "python" | "curl";
  label: string;
  filename: string;
  lines: CodeLine[];
}

export const LANG_SAMPLES: LangSample[] = [
  {
    id: "javascript",
    label: "JavaScript",
    filename: "scan.js",
    lines: [
      [
        { t: "const ", c: "kw" },
        { t: "result", c: "plain" },
        { t: " = ", c: "punct" },
        { t: "await ", c: "kw" },
        { t: "nikscanner", c: "plain" },
        { t: ".", c: "punct" },
        { t: "scan", c: "fn" },
        { t: "({", c: "punct" },
      ],
      [
        { t: "  url: ", c: "plain" },
        { t: '"https://example.com"', c: "str" },
      ],
      [{ t: "});", c: "punct" }],
      [],
      [
        { t: "if ", c: "kw" },
        { t: "(", c: "punct" },
        { t: "result", c: "plain" },
        { t: ".", c: "punct" },
        { t: "malicious", c: "plain" },
        { t: ") {", c: "punct" },
      ],
      [
        { t: "  block", c: "fn" },
        { t: "(", c: "punct" },
        { t: "result", c: "plain" },
        { t: ".", c: "punct" },
        { t: "url", c: "plain" },
        { t: ");", c: "punct" },
      ],
      [{ t: "}", c: "punct" }],
      [],
    ],
  },
  {
    id: "python",
    label: "Python",
    filename: "scan.py",
    lines: [
      [
        { t: "result", c: "plain" },
        { t: " = ", c: "punct" },
        { t: "nikscanner", c: "plain" },
        { t: ".", c: "punct" },
        { t: "scan", c: "fn" },
        { t: "(", c: "punct" },
      ],
      [
        { t: "    url=", c: "plain" },
        { t: '"https://example.com"', c: "str" },
      ],
      [{ t: ")", c: "punct" }],
      [],
      [
        { t: "if ", c: "kw" },
        { t: "result", c: "plain" },
        { t: ".", c: "punct" },
        { t: "malicious", c: "plain" },
        { t: ":", c: "punct" },
      ],
      [
        { t: "    block", c: "fn" },
        { t: "(", c: "punct" },
        { t: "result", c: "plain" },
        { t: ".", c: "punct" },
        { t: "url", c: "plain" },
        { t: ")", c: "punct" },
      ],
      [],
    ],
  },
  {
    id: "curl",
    label: "cURL",
    filename: "scan.sh",
    lines: [
      [
        { t: "curl ", c: "fn" },
        { t: "-X POST ", c: "kw" },
        { t: "https://api.nikscanner.com/v1/scan/url ", c: "str" },
        { t: "\\", c: "punct" },
      ],
      [
        { t: "  -H ", c: "kw" },
        { t: '"Authorization: Bearer $API_KEY" ', c: "str" },
        { t: "\\", c: "punct" },
      ],
      [
        { t: "  -H ", c: "kw" },
        { t: '"Content-Type: application/json" ', c: "str" },
        { t: "\\", c: "punct" },
      ],
      [
        { t: "  -d ", c: "kw" },
        { t: "'{\"url\": \"https://example.com\"}'", c: "str" },
      ],
      [],
    ],
  },
];

export const RESPONSE_LINES: CodeLine[] = [
  [{ t: "{", c: "punct" }],
  [
    { t: '  "safe"', c: "plain" },
    { t: ": ", c: "punct" },
    { t: "false", c: "danger" },
    { t: ",", c: "punct" },
  ],
  [
    { t: '  "risk_score"', c: "plain" },
    { t: ": ", c: "punct" },
    { t: "86", c: "danger" },
    { t: ",", c: "punct" },
  ],
  [
    { t: '  "category"', c: "plain" },
    { t: ": ", c: "punct" },
    { t: '"phishing"', c: "danger" },
    { t: ",", c: "punct" },
  ],
  [
    { t: '  "confidence"', c: "plain" },
    { t: ": ", c: "punct" },
    { t: "0.98", c: "num" },
  ],
  [{ t: "}", c: "punct" }],
];

export const TOKEN_CLASS_NAME: Record<TokenClass, string> = {
  kw: "text-flame-bright",
  str: "text-[#ffb17a]",
  fn: "text-soft-white font-semibold",
  plain: "text-soft-white",
  punct: "text-muted",
  num: "text-flame-bright",
  comment: "text-muted italic",
  danger: "text-danger",
};
