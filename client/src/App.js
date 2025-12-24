import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { isAuthenticated } from "./utils/auth";
import Editor from "./pages/Editor";
import SnippetView from "./pages/SnippetView";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />

        <Route
            path="/editor/:id"
            element={
              isAuthenticated() ? <Editor /> : <Navigate to="/login" />
            }
        />

        <Route path="/snippet/:id" element={<SnippetView />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;