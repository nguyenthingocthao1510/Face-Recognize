import Navbar from "./Navbar";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedOption, setSelectedOption] = useState('Attendance'); // Default to 'Attendance'

  useEffect(() => {
    fetchAttendanceData(); // Fetch data initially
    const interval = setInterval(fetchAttendanceData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch("http://localhost:8080/");
      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }
      const data = await response.json();
      // Sort the attendance data based on time in descending order
      data.sort((a, b) => {
        return new Date(b.time.replace('_', ' ')) - new Date(a.time.replace('_', ' '));
      });
      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error.message);
    }
  };

  const openImage = (image) => {
    setSelectedImage(image);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const filteredAttendance = attendanceData.filter((attendance) => {
    // Filter based on the selected date
    const dateFiltered = selectedDate ? attendance.time.startsWith(selectedDate) : true;
    // Filter based on the selected option
    const optionFiltered = selectedOption === 'Attendance' ? true : attendance.name === 'intruder';
    return dateFiltered && optionFiltered;
  });

  return (
    <div className="home-container">
      <Navbar />
      <div className="home-banner-container1">
        <div className="b1">
          <h2 className="Attendance">Attendance</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
          />
          <select value={selectedOption} onChange={handleOptionChange}>
            <option value="Attendance">All</option>
            <option value="Intruder">Intruder</option>
          </select>
        </div>
        <div className="b2">
          <table>
            <tbody>
              <tr id="header">
                <th>Time</th>
                <th>Name</th>
                <th>Image</th>
              </tr>
              {filteredAttendance.map((attendance) => (
                <tr key={attendance._id} style={{ backgroundColor: attendance.name === 'intruder' ? '#4a63ee82' : 'inherit' }}>
                <td>{attendance.time}</td>
                <td>{attendance.name}</td>
                <td>
                  {/* Display the image if available */}
                  {attendance.image && (
                    <img
                      src={`data:image/jpeg;base64,${encodeBase64FromArrayBuffer(
                        attendance.image.data
                      )}`}
                      alt="Attendance Image"
                      style={{ maxWidth: "100px", cursor: "pointer" }}
                      onClick={() => openImage(attendance.image)}
                    />
                  )}
                </td>
              </tr>
              
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedImage && (
        <div className="modal">
          <span className="close" onClick={closeImage}>
            <FontAwesomeIcon icon={faTimes} className="close-icon" />
          </span>
          <img
            src={`data:image/jpeg;base64,${encodeBase64FromArrayBuffer(
              selectedImage.data
            )}`}
            alt="Attendance Image"
            className="modal-content"
          />
        </div>
      )}
    </div>
  );
};

export default Attendance;

function encodeBase64FromArrayBuffer(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
