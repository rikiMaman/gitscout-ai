import React, { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RepoCard from './components/RepoCard';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

function App() {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setRepos([]);

    try {
      const response = await fetch(`${BASE_URL}/api/review/${username.trim()}`);
      
      // 🎯 טיפול מקצועי בשגיאות שהשרת החדש זורק (כמו 404 משתמש לא קיים או 502 תקלה ב-GitHub)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Our AI orchestration layer experienced an error.');
      }

      // 🧠 תחילת הטיפול ב-Streaming (Server-Sent Events)
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          // מפענחים את הביטים שקיבלנו לטקסט רגיל ומוסיפים ל-Buffer
          buffer += decoder.decode(value, { stream: !done });
          
          // שרתים שולחים אירועי SSE עם תחילית של "data: " ומסתיימים ב-\n\n
          const lines = buffer.split('\n\n');
          // משאירים את החלק האחרון בתוך הבאפר אם הוא נחתך באמצע שורה
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              // 🔥 תיקון באג ה-strip: שימוש ב-trim() התקני של JavaScript
              const jsonString = line.replace('data: ', '').trim();
              
              if (!jsonString) continue;

              try {
                const parsedData = JSON.parse(jsonString);
                
                // בודקים אם יש לנו כבר מערך של רפוזטוריז מוכן (אפילו חלקי!)
                if (parsedData && parsedData.repositories && Array.isArray(parsedData.repositories)) {
                  setRepos(parsedData.repositories);
                  
                  // 🔥 חווית משתמש מטורפת: ברגע שהכרטיסייה הראשונה מגיעה, 
                  // אנחנו מכבים את ה-Loading הכללי כדי שהמשתמש יראה אותן צצות בלייב!
                  if (parsedData.repositories.length > 0) {
                    setLoading(false);
                  }
                }
              } catch (jsonErr) {
                // לפעמים ה-JSON עדיין לא הגיע שלם לחלוטין, נתעלם ונחכה ל-Chunk הבא
                continue;
              }
            }
          }
        }
      }

      // 🔥 מבטיח כיבוי מלא של הטעינה רק כאשר כל הסטרים סיים להגיע לחלוטין
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false); // מבטיח כיבוי במקרה של תקלה
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased p-6 md:p-16 selection:bg-indigo-500/30 selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        <Header />

        <SearchBar 
          username={username}
          setUsername={setUsername}
          onSubmit={handleAnalyze}
          loading={loading && repos.length === 0} // מציג טעינה בבר רק כל עוד אין כרטיסיות בכלל
          disabled={loading}
        />

        {/* Error Notification */}
        {error && (
          <div className="max-w-md mx-auto mb-12 bg-red-950/20 border border-red-900/50 text-red-400 px-4 py-3.5 rounded-xl text-sm text-center backdrop-blur-sm animate-fade-in">
            <span className="font-semibold">Analysis Failed:</span> {error}
          </div>
        )}

        {/* Results Grid & Loading States */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* מציג את הודעת ה-Agent רק כל עוד המערך ריק לגמרי והוא טוען */}
          {loading && repos.length === 0 ? (
            <div className="col-span-full text-center py-20 text-indigo-400 animate-pulse font-medium text-lg">
              🤖 GitScout AI Agent is evaluating repository patterns and architectural complexity...
            </div>
          ) : (
            repos.map((repo, idx) => (
              <RepoCard key={idx} repo={repo} />
            ))
          )}
        </main>

        {/* Empty State Customer Success Feature */}
        {!loading && repos.length === 0 && !error && (
          <div className="text-center py-20 text-zinc-600 text-sm font-light">
            Ready to benchmark. Enter a public GitHub username above to query the RAG matrix.
          </div>
        )}

      </div>
    </div>
  );
}

export default App;