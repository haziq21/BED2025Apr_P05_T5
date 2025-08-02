const calendarGrid = document.querySelector(".calendar");
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/**
 * Fetches events for a specific month and year.
 * @typedef {Object} CalendarEvent
 * @property {string} title - The title of the event.
 * @property {string} time - The time of the event (formatted string).
 */

/**
 * @param {number} year The year to fetch events for.
 * @param {number} month The month to fetch events for (0-indexed).
 * @returns {Promise<{ [date: string]: CalendarEvent[] }>} A promise that resolves to an object where keys are date strings (YYYY-MM-DD) and values are arrays of CalendarEvent objects.
 */
export async function fetchEventsForMonth(year, month) {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No JWT token found.");
      window.location.href = "/login"; // Redirect to login if no token
      return {};
    }

    const response = await fetch("/api/events/registered", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        console.error("Authentication failed. Redirecting to login.");
        window.location.href = "/login";
        return {};
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    /** @type {any[]} */ // Assuming the initial response is an array of any type
    const events = await response.json();

    const currentMonthEvents = events.filter((event) => {
      const eventDate = new Date(event.StartDateTime);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    /** @type {{ [date: string]: CalendarEvent[] }} */ const formattedEvents =
      {};
    currentMonthEvents.forEach((event) => {
      const eventDate = new Date(event.StartDateTime);
      const dateString = `${eventDate.getFullYear()}-${String(
        eventDate.getMonth() + 1
      ).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`;
      if (!formattedEvents[dateString]) {
        formattedEvents[dateString] = [];
      }
      formattedEvents[dateString].push({
        title: event.name,
        time: eventDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });

    return formattedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return {};
  }
}
/**
 * Renders the calendar grid for a given month and year, displaying events.
 * @param {number} year - The year to render the calendar for.
 * @param {number} month - The month to render the calendar for (0-indexed).
 * @param {Object<string, Array<{title: string, time: string}>>} events - An object containing events, where keys are date strings (YYYY-MM-DD) and values are arrays of event objects.
 */
export function renderCalendar(year, month, events) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const numDaysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Add a check here to ensure calendarGrid is not null
  if (!calendarGrid) {
    console.error("Calendar grid element not found.");
    return;
  }

  // Remove existing day cells while keeping the day names
  while (calendarGrid.children.length > 7) {
    if (calendarGrid.lastChild) {
      calendarGrid.removeChild(calendarGrid.lastChild);
    } else {
      break; // Should not happen if children.length > 7, but as a safeguard
    }
  }

  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-cell");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= numDaysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("calendar-cell");

    const dateNumber = document.createElement("div");
    dateNumber.classList.add("date-number");
    dateNumber.textContent = String(day);
    cell.appendChild(dateNumber);

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    if (events[dateString]) {
      events[dateString].forEach((event) => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event");
        eventDiv.textContent = `${event.time} ${event.title}`;
        cell.appendChild(eventDiv);
      });
    }

    calendarGrid.appendChild(cell);
  }

  const totalCells = startingDayOfWeek + numDaysInMonth;
  let remainingCells = 0;
  if (totalCells % 7 !== 0) {
    remainingCells = 7 - (totalCells % 7);
  }

  for (let i = 0; i < remainingCells; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-cell");
    calendarGrid.appendChild(emptyCell);
  }
}

export async function StartGoogleAuth() {
  const token = localStorage.getItem("token"); // Get your JWT token

  if (!token) {
    console.error("No JWT token found.");
    return;
  }

  // Make a fetch request to  get the Google Auth URL
  const response = await fetch("/api/calendar/google/auth/url", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error(
      "Error from backend when getting Google Auth URL:",
      response.status,
      response.statusText
    );
    if (response.status === 401 || response.status === 403) {
      window.location.href = "/login"; // Redirect if unauthorized/forbidden
    }
    return;
  }

  const data = await response.json();

  // Redirect the user to the Google Auth URL received from the backend
  if (data && data.authUrl) {
    window.location.href = data.authUrl;
  } else {
    console.error("Backend did not provide a valid authUrl in the response.");
  }
}

// Add event listener after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initial calendar render
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  fetchEventsForMonth(currentYear, currentMonth).then((events) => {
    renderCalendar(currentYear, currentMonth, events);
  });

  // Add event listener for the Google Calendar button
  const linkButton = document.getElementById("linkGoogleCalendar");
  if (linkButton) {
    linkButton.addEventListener("click", StartGoogleAuth);
  }
});
