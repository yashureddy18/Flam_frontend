import React from 'react';
import { EventProvider } from './context/EventContext';
import Calendar from './components/Calendar/Calendar';
import Header from './components/UI/Header';

function App() {
  return (
    <EventProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Calendar />
        </main>
      </div>
    </EventProvider>
  );
}

export default App;