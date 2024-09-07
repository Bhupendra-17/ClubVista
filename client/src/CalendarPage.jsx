import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import { db, auth } from './firebase'; 
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth'; // Import auth

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    organizedFor: '',
    inCharge: '',
    date: '',
    details: '',
  });
  const [editEventId, setEditEventId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Track the current user

  // Listen to authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch events for the current user
  useEffect(() => {
    const fetchEvents = async () => {
      if (currentUser) {
        try {
          const q = query(collection(db, 'events'), where('uid', '==', currentUser.uid)); // Fetch events for the current user
          const snapshot = await getDocs(q);
          const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEvents(fetchedEvents);
        } catch (error) {
          console.error('Error fetching events: ', error);
        }
      }
    };
    fetchEvents();
  }, [currentUser]);

  // Handler for adding an event
  const handleDateClick = (arg) => {
    setNewEvent({ ...newEvent, date: arg.dateStr });
    setEditEventId(null);
    setIsModalOpen(true);
  };

  // Handler for updating an event
  const handleEventClick = (clickInfo) => {
    setNewEvent({
      title: clickInfo.event.title,
      date: clickInfo.event.startStr,
      organizedFor: clickInfo.event.extendedProps.organizedFor || '',
      inCharge: clickInfo.event.extendedProps.inCharge || '',
      details: clickInfo.event.extendedProps.details || '',
    });
    setEditEventId(clickInfo.event.id);
    setIsModalOpen(true);
  };

  // Handler for month change
  const handleDatesSet = (info) => {
    console.log('Month changed:', info.view.currentStart);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleAddEvent = async () => {
    if (!currentUser) return; // Ensure a user is logged in

    try {
      const eventWithUid = { ...newEvent, uid: currentUser.uid }; // Add user ID to the event
      const docRef = await addDoc(collection(db, 'events'), eventWithUid);
      const updatedEvents = [...events, { id: docRef.id, ...eventWithUid }];
      setEvents(updatedEvents);
      setIsModalOpen(false);
      setNewEvent({ title: '', details: '', organizedFor: '', inCharge: '', date: '' });
    } catch (error) {
      console.error('Error adding event: ', error);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editEventId || !currentUser) return; // Ensure the user is logged in and editing an event

    try {
      const eventDoc = doc(db, 'events', editEventId);
      const updatedEvent = { ...newEvent, uid: currentUser.uid }; // Ensure the uid is maintained
      await updateDoc(eventDoc, updatedEvent);
      const updatedEvents = events.map(event => event.id === editEventId ? { id: editEventId, ...updatedEvent } : event);
      setEvents(updatedEvents);
      setIsModalOpen(false);
      setEditEventId(null);
      setNewEvent({ title: '', organizedFor: '', inCharge: '', date: '' });
    } catch (error) {
      console.error('Error updating event: ', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error deleting event: ', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={events}
        eventColor="#378006"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        datesSet={handleDatesSet}
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-11/12 md:w-3/4 lg:w-3/4">
            <h3 className="text-xl font-bold mb-4">
              {editEventId ? 'Edit Event' : `Add Event on ${newEvent.date}`}
            </h3>
            <div className='lg:grid lg:grid-cols-2 gap-4 items-baseline'>
              <div>
                <label className="block mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  autoComplete='off'
                />
              </div>
              <div>
                <label className="block mb-2">Organized For</label>
                <input
                  type="text"
                  name="organizedFor"
                  value={newEvent.organizedFor}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  autoComplete='off'
                />
              </div>
              <div>
                <label className="block mb-2">In Charge</label>
                <input
                  type="text"
                  name="inCharge"
                  value={newEvent.inCharge}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  autoComplete='off'
                />
              </div>
              <div>
                <label className="block mb-2">Details</label>
                <textarea
                  name="details"
                  value={newEvent.details}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  autoComplete='off'
                />
              </div>
            </div>
            <div className="flex justify-start gap-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={editEventId ? handleUpdateEvent : handleAddEvent}
              >
                {editEventId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
