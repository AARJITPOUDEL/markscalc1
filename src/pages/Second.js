import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { db, collection, addDoc, getDocs } from '../firebase'; 
import { auth } from '../firebase'; 
import {  signOut } from "firebase/auth";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import styles from './style.module.css'; 
import { useRouter } from 'next/router';
import Router from 'next/router';
import ProtectedPage from './ProtectedPgae'; 
function Result({ students }) {
    const schoolName = 'Baraha';
    const handleMarksChange = (studentIndex, subjectIndex, term, marks) => {
      const updatedStudents = [...students];
      const parsedMarks = parseInt(marks);
  
      // Update the appropriate field based on the term
      if (term === 'secondTerm') {
        updatedStudents[studentIndex].subjects[subjectIndex].secondTermMarks = parsedMarks;
      }
  
      // Recalculate the total marks and grade for the student
      const filledFields = updatedStudents[studentIndex].subjects.filter(
        (subject) => subject.marks > 0 || subject.firstTermMarks > 0
      );
  
      if (filledFields.length === 0) {
        // No marks entered for any subject, reset the totalMarks and overallGrade
        updatedStudents[studentIndex].totalMarks = 0;
        updatedStudents[studentIndex].overallGrade = '';
      } else {
        const totalMarks = filledFields.reduce(
          (total, subject) => total + subject.firstTermMarks + subject.secondTermMarks,
          0
        );
        const averageMarks = totalMarks / (2 * filledFields.length); // Divide by 2 since we have two terms
        updatedStudents[studentIndex].totalMarks = totalMarks;
        updatedStudents[studentIndex].totalGPA = calculateGPA(averageMarks);
        updatedStudents[studentIndex].overallGrade = calculateGrade(averageMarks);
      }
  
      setStudents(updatedStudents);
    };
    const calculateGrade = (marks) => {
      if (marks >= 90) {  
        return 'A+';
      } else if (marks >= 80) {
        return 'A';
      } else if (marks >= 70) {
        return 'B';
      } else if (marks >= 60) {
        return 'C';
      } else if (marks >= 50) {
        return 'D';
      } else {
        return 'F';
      }
    };
  

  const cardRefs = useRef([]);

  const downloadReportCard = async (index) => {
    const card = cardRefs.current[index];

    try {
      const canvas = await html2canvas(card);
      const imageURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `report_card_${index + 1}.png`;
      link.click();
    } catch (error) {
      console.error('Error occurred during report card download:', error);
    }
  };
  const saveStudentData = async () => {
    const schoolName = 'Baraha';
    try {
      const collectionRef = collection(db, 'students');
      const filledStudents = students.filter((student) => {
        const allFieldsFilled = student.subjects.every((subject) => subject.marks > 0);
        return allFieldsFilled;
      });
      await Promise.all(
        filledStudents.map(async (student) => {
          await addDoc(collectionRef, { ...student, school: schoolName, term: "Second Term" });
        })
      );

      alert('Student data saved successfully');
    } catch (error) {
      console.log('Error occurred while saving student data:', error);
    }
  };

  return (
    <ProtectedPage allowedEmails={allowedEmailsForHome}>
    <div className={styles['report-card']}>
      <h2 className={styles.h2}>Report Card</h2>
      {students.map((student, index) => {
        const filledFields = student.subjects.filter((subject) => subject.secondTermMarks > 0);
        if (filledFields.length === 0) {
          return null;
        }

          return (
            <div key={index} className={styles['student-card']} ref={(ref) => (cardRefs.current[index] = ref)}>
               <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>2nd Term Marks</th>
                    <th>1st Term Marks</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {student.subjects.map((subject, subjectIndex) => {
                    if (subject.secondTermMarks > 0) {
                      return (
                        <tr key={subjectIndex}>
                          <td>{subject.name}</td>
                          <td>{subject.secondTermMarks}</td>
                          <td>{subject.marks}</td>
                          <td>{calculateGrade(subject.secondTermMarks)}</td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
              <div className={styles['result-summary']}>
                <p>Total Marks: {student.totalMarks}</p>
                <p>Total GPA: {student.totalGPA.toFixed(2)}</p>
                <p>Overall Grade: {student.overallGrade}</p>
              </div>
              <button onClick={() => downloadReportCard(index)}>Download Report Card</button>
            </div>
          );
        })}
        <button onClick={saveStudentData}>Save Student Data</button>
      </div>
    </ProtectedPage>
  );
}
const allowedEmailsForHome = ['poudelaarjit@gmail.com'];
function App() {
  const [selectedTerm, setSelectedTerm] = useState('Second Term'); 
  const saveStudentDataForBaraha = () => {
  saveStudentData('Baraha');  
};
const [students, setStudents] = useState(
  Array(20).fill().map(() => ({
    name: '',
    subjects: [
      { name: 'English', marks: 0, secondTermMarks: 0 },
      { name: 'Social', marks: 0, secondTermMarks: 0 },
      { name: 'Nepali', marks: 0, secondTermMarks: 0 },
      { name: 'Maths', marks: 0, secondTermMarks: 0 },
    ],
    totalMarks: 0,
    totalGPA: 0,
    overallGrade: '',
  }))
);

  const router = useRouter();
  const [showResult, setShowResult] = useState(false);
  const [showData, setShowData] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleNameChange = (index, name) => {
    const updatedStudents = [...students];
    updatedStudents[index].name = name;
    setStudents(updatedStudents);
  };

  const handleMarksChange = (studentIndex, subjectIndex, term, marks) => {
    const updatedStudents = [...students];
    const parsedMarks = parseInt(marks);

    // Update the appropriate field based on the term
    if (term === 'secondTerm') {
      updatedStudents[studentIndex].subjects[subjectIndex].secondTermMarks = parsedMarks;
    }

    // Recalculate the total marks and grade for the student
    const filledFields = updatedStudents[studentIndex].subjects.filter(
      (subject) => subject.secondTermMarks > 0
    );

    if (filledFields.length === 0) {
      // No marks entered for any subject, reset the totalMarks and overallGrade
      updatedStudents[studentIndex].totalMarks = 0;
      updatedStudents[studentIndex].totalGPA = 0;
      updatedStudents[studentIndex].overallGrade = '';
    } else {
      const totalMarks = filledFields.reduce(
        (total, subject) => total + subject.secondTermMarks,
        0
      );
      const averageMarks = totalMarks / filledFields.length;
      const overallTotalMarks = totalMarks;
      const overallAverageMarks = averageMarks;

      updatedStudents[studentIndex].totalMarks = overallTotalMarks;
      updatedStudents[studentIndex].totalGPA = calculateGPA(overallAverageMarks);
      updatedStudents[studentIndex].overallGrade = calculateGrade(overallAverageMarks);
    }

    setStudents(updatedStudents);
  };
  const calculateMarks = () => {
    const updatedStudents = students.map((student) => {
      const filledFields = student.subjects.filter(
        (subject) => subject.secondTermMarks > 0
      );
      if (filledFields.length === 0) {
        // No marks entered for any subject, reset the totalMarks and overallGrade
        return {
          ...student,
          totalMarks: 0,
          totalGPA: 0,
          overallGrade: '',
        };
      }

      const totalMarks = filledFields.reduce(
        (total, subject) => total + subject.secondTermMarks,
        0
      );
      const averageMarks = totalMarks / filledFields.length;
      const overallTotalMarks = totalMarks;
      const overallAverageMarks = averageMarks;

      return {
        ...student,
        totalMarks: overallTotalMarks,
        totalGPA: calculateGPA(overallAverageMarks),
        overallGrade: calculateGrade(overallAverageMarks),
      };
    });

    setStudents(updatedStudents);
    setShowResult(true);
  };


  const calculateGrade = (marks) => {
    if (marks >= 90) {
      return 'A+';
    } else if (marks >= 80) {
      return 'A';
    } else if (marks >= 70) {
      return 'B';
    } else if (marks >= 60) {
      return 'C';
    } else if (marks >= 50) {
      return 'D';
    } else {
      return 'F';
    }
  };

  const calculateGPA = (marks) => {
    if (marks >= 90) {
      return 4.0;
    } else if (marks >= 80) {
      return 3.7;
    } else if (marks >= 70) {
      return 3.3;
    } else if (marks >= 60) {
      return 3.0;
    } else if (marks >= 50) {
      return 2.7;
    } else {
      return 0.0;
    }
  };

  const showSavedData = async () => {
    const schoolName = 'Baraha';
    try {
      const studentsCollectionRef = collection(db, 'students');
      const querySnapshot = await getDocs(studentsCollectionRef);
      const retrievedStudents = querySnapshot.docs.map((doc) => doc.data());
      
      // Initialize the secondTermMarks property to 0 for all subjects
      const updatedStudents = retrievedStudents.map((student) => ({
        ...student,
        subjects: student.subjects.map((subject) => ({
          ...subject,
          secondTermMarks: 0,
        })),
      }));
      
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Error occurred while retrieving student data:', error);
    }
  };
  const handleLogout = () => {               
    signOut(auth).then(() => {
      router.push('/');
      console.log("Signed out successfully")
    }).catch((error) => {
    });
}
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  });

  showSavedData();
    return () => unsubscribe();
  }, [selectedTerm]); 




  return (<ProtectedPage allowedEmails={allowedEmailsForHome}>
    <div style={{ fontFamily: 'Arial, sans-serif' }} className={styles.body}>    
      {loggedIn && <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>}

      <h1 className={styles.h1}>Marks Calculator</h1>
      {/* <div>
        <button onClick={() => setSelectedTerm('First Term')}>First Term</button>
        <button onClick={() => setSelectedTerm('Second Term')}>Second Term</button>
        <button onClick={() => setSelectedTerm('Third Term')}>Third Term</button>
      </div> */}
      <h1 className={styles.h1}>Marks Calculator</h1>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>English</th>
              <th>Social</th>
              <th>Nepali</th>
              <th>Maths</th>
              <th>Total Marks</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className={styles.inputs}
                  />
                </td>
                {student.subjects.map((subject, subjectIndex) => (
                  <td key={subjectIndex}>
                    {/* <input
                      type="number"
                      value={subject.marks}
                      onChange={(e) =>
                        handleMarksChange(index, subjectIndex, e.target.value)
                      }
                      min="0"
                      max="100"
                      className={styles.inputs}
                    /> */}
                  <input
  type="number"
  value={subject.secondTermMarks}
  onChange={(e) =>
    handleMarksChange(index, subjectIndex, 'secondTerm', e.target.value)
  }
  min="0"
  max="100"
  className={styles.secondinputs}
/>

                  </td>
                ))}
                <td>{student.totalMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>

      <button style={{ marginTop: '10px' }} onClick={calculateMarks}>
        Calculate
      </button>

      <button style={{ marginTop: '10px' }} onClick={() => showSavedData(selectedTerm)}>
          Show Data
        </button>

      {showResult && <Result students={students} selectedTerm={selectedTerm} />} 
        {showData && <Result students={students} selectedTerm={selectedTerm} />}
        <Result students={students} selectedTerm={selectedTerm} />

    </div>
    </ProtectedPage>
  );
}

export default App;