import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [text, setText] = useState("");
  return (
    <div className="App">
      <textarea
        value={text}
        onChange={e => {
          setText(e.target.value);
        }}
      />
      <button type="button" onClick={() => convertJsx(text, setText)}>
        Convert JSX/TSX
      </button>

      <button type="button" onClick={() => convertCSS(text, setText)}>
        Convert CSS/Less
      </button>
    </div>
  );
}

function convertJsx(text, setText) {
  setText(
    convertTextByRules(text, [
      [/className="(.+?)"/g, $ => `className={${getClassNames($[1])}}`],
      [/className='(.+?)'/g, $ => `className={${getClassNames($[1])}}`],
      [
        /className=\{cn\('(.+?)'/g,
        $ => `className={cn(${getClassNames2($[1])}`
      ],
      [
        /import '.\/index.less'/,
        $ => `import * as styles from './index.module.less'`
      ]
    ])
  );

  function getClassNames(s) {
    const classNames = s.split(" ").map(n => `styles.${camleCase(n)}`);
    return classNames.length > 1
      ? `cn(${classNames.join(", ")})`
      : classNames[0];
  }
  function getClassNames2(s) {
    const classNames = s.split(" ").map(n => `styles.${camleCase(n)}`);
    return classNames.length > 1 ? `${classNames.join(", ")}` : classNames[0];
  }
}

function convertCSS(text, setText) {
  setText(
    convertTextByRules(text, [
      [
        /\.(\S+?)([,: ])/,
        $ =>
          /^(size|mode|is|has|ant)-/.test($[1])
            ? `:global(.${$[1]})${$[2]}`
            : `.${camleCase($[1])}${$[2]}`
      ]
    ])
  );
}

function convertTextByRules(text, rules) {
  const res = rules
    .reduce(
      (lines, [regex, replacement]) =>
        lines.map((line, index) =>
          line.replace(regex, (...$) => replacement($, index))
        ),
      text.split("\n")
    )
    .join("\n");

  copyToClipboard(res);
  return res;
}

function camleCase(s) {
  return s.replace(/-([a-zA-Z])/g, (_, c) => c.toUpperCase());
}

function copyToClipboard(text) {
  const input = document.createElement("textarea");
  document.body.appendChild(input);
  input.value = text;
  input.select();
  document.execCommand("copy");
  input.remove();
}
