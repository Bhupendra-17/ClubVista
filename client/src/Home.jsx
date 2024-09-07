// Import necessary functions
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CalendarPage from './CalendarPage'; 
import { db, auth, storage } from './firebase'; // Added auth import for user authentication
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth'; // Auth state listener
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './CalendarPage.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    organizedFor: '',
    inCharge: '',
    date: '',
    details: '',
  });
  const [currentUser, setCurrentUser] = useState(null); // Store the currently logged-in user
  const [editEventId, setEditEventId] = useState(null); 
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Check for logged-in user and set currentUser
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set the logged-in user
      } else {
        // Redirect to login or show a message
        setCurrentUser(null);
      }
    });
  }, []);

  // Fetch events for the current user
  useEffect(() => {
    const fetchEvents = async () => {
      if (currentUser) {
        try {
          const q = query(collection(db, 'events'), where('uid', '==', currentUser.uid)); // Filter by uid
          const snapshot = await getDocs(q);
          const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEvents(fetchedEvents);
        } catch (error) {
          console.error('Error fetching events: ', error);
        }
      }
    };
    fetchEvents();
  }, [currentUser]); // Fetch events only when the user is logged in

  const filteredEvents = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    return events.filter(event => new Date(event.date).getMonth() + 1 === currentMonth);
  }, [events]);

  const handleDateClick = useCallback((info) => {
    setNewEvent({ ...newEvent, date: info.dateStr });
    setEditEventId(null); 
    setIsModalOpen(true); 
  }, [newEvent]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const fetchFileForEvent = useCallback(async (eventId) => {
    const filesQuery = query(collection(db, 'files'), where('eventId', '==', eventId));
    const fileSnapshot = await getDocs(filesQuery);
    const files = fileSnapshot.docs.map(doc => doc.data());

    if (files.length > 0) {
      return files[0].url; 
    } else {
      return null;
    }
  }, []);

  const handleDeleteEvent = async (id) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error deleting event: ', error);
    }
  };

  const handleUploadReport = async () => {
    if (!file || !selectedEvent) return;

    setUploading(true);

    const storageRef = ref(storage, `reports/${selectedEvent.id}/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'files'), { eventId: selectedEvent.id, url: fileURL, name: file.name });

      alert('File uploaded successfully!');
      setFile(null); 
      setSelectedEvent(null); 
    } catch (error) {
      console.error('Error uploading file: ', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-700 to-stone-700 p-6 pb-12">
      <h1 className="text-3xl font-bold mb-9 text-white hover:text-rose-300">Welcome to Club Manager</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5 border border-gray-300 shadow-md p-4  bg-gradient-to-r from-rose-300 to-orange-300 rounded-lg ">
          <CalendarPage events={events} onDateClick={handleDateClick} />
        </div>

        <div className="lg:w-2/5 border border-gray-300 shadow-md p-4 bg-gradient-to-r from-rose-300 to-orange-300 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Event List</h2>

          {filteredEvents.length === 0 ? (
            <p>No events available for this month</p>
          ) : (
            <ul className=" flex flex-col gap-2">
              {filteredEvents.map(event => (
                <li key={event.id} className=" bg-white px-5 py-1 rounded-lg">
                  <div>
                    <strong>{event.title}</strong> on <strong>{event.date}</strong>
                  </div>
                  <div className="text-sm text-gray-600">
                    Organized For: {event.organizedFor} | In-Charge: {event.inCharge}
                  </div>
                  <div className="flex gap-2 mt-2 text-md">
                    <button
                      className="border border-gray-500 py-1 hover:bg-black hover:text-white rounded-full px-3 font-semibold "
                      onClick={async () => {
                        const fileUrl = await fetchFileForEvent(event.id);
                        if (fileUrl) {
                          window.open(fileUrl, '_blank');
                        } else {
                          alert('No report available for this event.');
                        }
                      }}>
                      View File
                    </button>
                    <button
                      className="border border-gray-500 rounded-full px-3 font-semibold  hover:bg-black hover:text-white"
                      onClick={() => setSelectedEvent(event)}
                    >
                      Upload Report
                    </button>
                    <button
                      className="text-red-600 border border-gray-500 rounded-full px-3 font-semibold  hover:bg-red-600 hover:text-white"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-11/12 md:w-3/4 lg:w-3/4">
              <h3 className="text-xl font-bold mb-4">Upload Report for {selectedEvent.title}</h3>
              <input type="file" onChange={handleFileChange} />
              <div className="flex justify-start gap-4 mt-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setSelectedEvent(null)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleUploadReport}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
