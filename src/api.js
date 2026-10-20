import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

// Automatically attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (data) => API.post('/api/auth/register', data);
export const login    = (data) => API.post('/api/auth/login', data);
export const getMe    = ()     => API.get('/api/auth/me');

// ── Chat Socket Rooms (Phase 1 — real-time messaging) ────────────────────────
export const getRooms    = ()        => API.get('/api/chat/rooms');
export const getMessages = (roomId)  => API.get(`/api/chat/${roomId}/messages`);
export const createRoom  = (data)    => API.post('/api/chat/room', data);

// ── Chat Sessions (Phase 1 — session history) ────────────────────────────────
export const saveChatSession   = (data) => API.post('/api/chat-sessions', data);
export const getChatSessions   = ()     => API.get('/api/chat-sessions');
export const getChatStats      = ()     => API.get('/api/chat-sessions/stats');
export const deleteChatSession = (id)   => API.delete(`/api/chat-sessions/${id}`);

// ── Media ─────────────────────────────────────────────────────────────────────
export const uploadMedia   = (formData) => API.post('/api/media/upload', formData);
export const describeImage = (formData) => API.post('/api/media/describe-image', formData);

// ── Pictograms (Phase 2) ──────────────────────────────────────────────────────
export const savePictogramSession   = (data) => API.post('/api/pictograms/session', data);
export const getPictogramHistory    = ()     => API.get('/api/pictograms/history');
export const getPictogramStats      = ()     => API.get('/api/pictograms/stats');
export const deletePictogramSession = (id)   => API.delete(`/api/pictograms/session/${id}`);

// ── Custom Phrases (Phase 3) ──────────────────────────────────────────────────
export const getPhrases   = ()     => API.get('/api/phrases');
export const createPhrase = (data) => API.post('/api/phrases', data);
export const usePhrase    = (id)   => API.patch(`/api/phrases/${id}/use`);
export const deletePhrase = (id)   => API.delete(`/api/phrases/${id}`);

// ── Sign Language (Phase 4) ───────────────────────────────────────────────────
export const saveSignSession   = (data)   => API.post('/api/signs/session', data);
export const getSignHistory    = (params) => API.get('/api/signs/history', { params });
export const getSignStats      = ()       => API.get('/api/signs/stats');
export const deleteSignSession = (id)     => API.delete(`/api/signs/session/${id}`);

// ── Community (Phase 6) ───────────────────────────────────────────────────────
export const getCommunityPosts   = (params) => API.get('/api/community', { params });
export const createCommunityPost = (data)   => API.post('/api/community', data);
export const togglePostLike      = (id)     => API.post(`/api/community/${id}/like`);
export const deleteCommunityPost = (id)     => API.delete(`/api/community/${id}`);

// ── Emergency SOS ─────────────────────────────────────────────────────────────
export const sendSOSAlert  = (data) => API.post('/api/sos/alert', data);
export const getSOSHistory = ()     => API.get('/api/sos/history');

// ── Symptom Communicator ──────────────────────────────────────────────────────
export const saveSymptomReport = (data) => API.post('/api/symptoms/report', data);
export const getSymptomHistory = ()     => API.get('/api/symptoms/history');
export const getSymptomStats   = ()     => API.get('/api/symptoms/stats');

export const getAccessibilityPrefs  = ()     => API.get('/api/accessibility/prefs');
export const saveAccessibilityPrefs = (data) => API.put('/api/accessibility/prefs', data);
export const logVoiceCommand        = (data) => API.post('/api/accessibility/voice-log', data);
export const getVoiceStats          = ()     => API.get('/api/accessibility/voice-stats');

// ── Smart Phrase Suggestions ──────────────────────────────────────────────────
export const getSmartSuggestions = (data) => API.post('/api/smart-phrases/suggest', data);

// ── Translation (Google Translate — free, accurate) ───────────────────────────
export const translateText = async ({ text, from = 'en', to }) => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    const translatedText = data[0].map(item => item[0]).join('');
    return { data: { translatedText } };
  } catch {
    return { data: { translatedText: text } };
  }
};