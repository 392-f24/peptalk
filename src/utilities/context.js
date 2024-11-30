import React, { createContext, useContext, useState, useEffect } from 'react';
import { signOut } from './firebase_helper';
import axiosInstance from './axiosHelper';

const pepContext = createContext();

export function usePepContext() {
  const context = useContext(pepContext);
  if (!context) {
    throw new Error('usePepContext must be used within a PepProvider');
  }
  return context;
}

export function PepProvider(props) {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState(null);
  
  // Data state
  const [entries, setEntries] = useState([]);
  const [recaps, setRecaps] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const savedName = localStorage.getItem("name");
    if (savedUserId) setUserId(savedUserId);
    if (savedName) setName(savedName);
  }, []);

  const login = async (handleGoogleLogin, navigate) => {
    try {
      setIsLoading(true);
      setError(null);
      const { googleUid, name } = await handleGoogleLogin();

      const response = await axiosInstance.post("/auth/signup", {
        userId: googleUid,
        name,
      });

      if (response.status === 200) {
        setUserId(googleUid);
        setName(name);
        localStorage.setItem("userId", googleUid);
        localStorage.setItem("name", name);
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (navigate) => {
    try {
      await signOut();
      localStorage.removeItem("userId");
      localStorage.removeItem("name");
      setUserId(null);
      setName(null);
      navigate("/");
    } catch (error) {
      setError(error.message);
      console.error("Logout error:", error);
    }
  };

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/entry/entry-data", {
        params: { userId },
      });
      setEntries(response.data.entries);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createEntry = async (entryData) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/entry/create-entry", {
        userId,
        ...entryData,
      });
      setEntries(prev => [...prev, response.data.newEntry]);
      return response.data.newEntry;
    } catch (error) {
      setError(error.message);
      console.error("Error creating entry:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      setIsLoading(true);
      await axiosInstance.delete("/entry/delete-entry", {
        params: { userId, entryId },
      });
      setEntries(prev => prev.filter(entry => entry._id !== entryId));
    } catch (error) {
      setError(error.message);
      console.error("Error deleting entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    userId,
    name,
    entries,
    recaps,
    currentEntry,
    isLoading,
    error,
    login,
    logout,
    fetchEntries,
    createEntry,
    deleteEntry,
    setError,
    setCurrentEntry
  };

  return React.createElement(pepContext.Provider, 
    { value },
    props.children
  );
}