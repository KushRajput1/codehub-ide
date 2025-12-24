import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import API from "../services/api";
import "./Editor.css";

const CodeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [language, setLanguage] = useState("javascript");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [useInput, setUseInput] = useState(false);

  // ✅ STEP A1
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");

  const [running, setRunning] = useState(false);
  const [lastSavedCode, setLastSavedCode] = useState("");
  const [status, setStatus] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const editorRef = useRef(null);
  const runRef = useRef(() => {});

  const [theme, setTheme] = useState(
    localStorage.getItem("editorTheme") || "vs-dark"
  );

  /* ===== LOAD FILE ===== */
  useEffect(() => {
    const loadFile = async () => {
      try {
        const res = await API.get(`/files/${id}`);
        setLanguage(res.data.language);
        setTitle(res.data.title);
        setCode(res.data.code || "");
        setInput(res.data.input || "");
        setUseInput(!!res.data.input);
        setLastSavedCode(res.data.code || "");
      } catch {
        navigate("/dashboard");
      }
    };
    loadFile();
  }, [id, navigate]);

  /* ===== AUTO SAVE ===== */
  useEffect(() => {
    const interval = setInterval(() => {
      if (code !== lastSavedCode) {
        API.put(`/files/${id}`, {
          title,
          code,
          language,
          input: useInput ? input : "",
        }).then(() => {
          setLastSavedCode(code);
          setStatus("Auto-saved");
          setTimeout(() => setStatus(""), 1500);
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [code, lastSavedCode, id, title, input, useInput, language]);

  /* ===== RUN CODE ===== */
  const runCodeWithCode = useCallback(async () => {
    // STEP A4 — input warning
    if (useInput && !input.trim()) {
      setStderr("Input is enabled but no input was provided.");
      setStdout("");
      return;
    }

    setRunning(true);
    setStdout("");
    setStderr("");
    setStatus("Running...");

    try {
      const res = await API.post("/run", {
        language,
        code,
        input: useInput ? input : "",
      });

      if (res.data.error) {
        setStderr(res.data.error); // STEP A3
      } else {
        setStdout(res.data.output || "");
      }
    } catch {
      setStderr("Execution failed.");
    }

    setRunning(false);
    setStatus("Finished");
    setTimeout(() => setStatus(""), 1500);
  }, [language, code, input, useInput]);

  /* ===== KEEP REF UPDATED ===== */
  useEffect(() => {
    runRef.current = runCodeWithCode;
  }, [runCodeWithCode]);

  /* ===== CTRL + ENTER ===== */
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => runRef.current()
    );
  };

  /* ===== LANGUAGES ===== */
  useEffect(() => {
    API.get("/languages").then(res => setAvailableLanguages(res.data));
  }, []);

  /* ===== THEME ===== */
  const toggleTheme = () => {
    const next = theme === "vs-dark" ? "light" : "vs-dark";
    setTheme(next);
    localStorage.setItem("editorTheme", next);
  };

  /* ===== SNIPPET ===== */
  const shareSnippet = async () => {
    const res = await API.post("/snippets", { fileId: id });
    navigator.clipboard.writeText(
      `${window.location.origin}/snippet/${res.data.snippetId}`
    );
    alert("Snippet link copied!");
  };

  /* ===== DOWNLOAD ===== */
  const downloadCode = () => {
    const ext =
      language === "javascript"
        ? "js"
        : language === "python"
        ? "py"
        : language === "java"
        ? "java"
        : "txt";

    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title || "code"}.${ext}`;
    link.click();
  };

  /* ===== MANUAL SAVE ===== */
  const saveFile = async () => {
    try {
      await API.put(`/files/${id}`, {
        title,
        code,
        language,
        input: useInput ? input : "",
      });
      setLastSavedCode(code);
      setStatus("Saved");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      alert("Save failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <div className="editor-left">
          <span className="brand">CodeCraft</span>
          <span className="subtitle">Interactive Code Editor</span>
        </div>

        <div className="editor-actions">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {availableLanguages.map((l) => (
              <option key={l.key} value={l.key}>{l.label}</option>
            ))}
          </select>

          <button className="icon-btn" onClick={toggleTheme}>🎨</button>
          <button className="icon-btn" onClick={shareSnippet}>🔗</button>
          <button className="icon-btn" onClick={downloadCode}>⬇️</button>
          <button className="pill-btn" onClick={saveFile}>💾 Save</button>

          <button
            className={`run-btn ${running ? "running" : ""}`}
            onClick={runCodeWithCode}
            disabled={running}
          >
            ▶ {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      <div className="editor-main">
        <div className="editor-panel">
          <input
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="File title"
          />

          <Editor
            height="400px"
            language={language}
            value={code}
            theme={theme}
            onChange={(v) => setCode(v || "")}
            onMount={handleEditorMount}
          />

          <div className="stdin-toggle">
            <label>
              <input
                type="checkbox"
                checked={useInput}
                onChange={(e) => setUseInput(e.target.checked)}
              />
              Use stdin input
            </label>
          </div>

          {useInput && (
            <textarea
              rows="4"
              value={input}
              placeholder="Enter stdin input"
              onChange={(e) => setInput(e.target.value)}
            />
          )}
        </div>

        <div className="output-panel">
          <div className="output-header">Output</div>
          <pre className={`output-content ${stderr ? "output-error" : ""}`}>
            {stderr || stdout || "Run your code to see output here..."}
          </pre>
        </div>
      </div>

      {status && <p className="status-text">{status}</p>}
    </div>
  );
};

export default CodeEditor;