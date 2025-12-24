import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";

const SnippetView = () => {
  const { id } = useParams();
  const [snippet, setSnippet] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/snippets/${id}`)
      .then((res) => setSnippet(res.data))
      .catch(() => alert("Snippet not found"));
  }, [id]);

  if (!snippet) return null;

  return (
    <div>
      <h2>Shared Snippet</h2>
      <Editor
        height="400px"
        language={snippet.file.language}
        value={snippet.file.code}
        options={{ readOnly: true }}
        theme="vs-dark"
      />
    </div>
  );
};

export default SnippetView;