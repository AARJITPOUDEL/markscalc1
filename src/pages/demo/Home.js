import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { db, collection, addDoc, getDocs } from '../../firebase'; 
import { auth } from '../../firebase'; 
import {  signOut } from "firebase/auth";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import styles from './style.module.css'; 
import { useRouter } from 'next/router';
import ProtectedPage from '../ProtectedPgae'; 
function Result({ students }) {
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
    const schoolName = 'Pragati';
    try {
      const collectionRef = collection(db, "students");
      const filledStudents = students.filter((student) => {
        const allFieldsFilled = student.subjects.every((subject) => subject.marks > 0);
        return allFieldsFilled;
      });
      await Promise.all(
        filledStudents.map(async (student) => {
          await addDoc(collectionRef, { ...student, school: schoolName }); // Include the school name
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
        const filledFields = student.subjects.filter((subject) => subject.marks > 0);
        if (filledFields.length === 0) {
          return null;
        }

        return (
          <div key={index} className={styles['student-card']} ref={(ref) => (cardRefs.current[index] = ref)}>
            <div className={styles['school-info']}>
              <h3 className={styles.h3}>School Name</h3>
              <p>Address, City</p>
              <p>Phone: XXXXXXXXXX</p>
            </div>
            <div className={styles['student-info']}>
              <h4 className={styles.h4}>Student: {student.name}</h4>
              <p>Class: X</p>
              <p>Roll Number: {index + 1}</p>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {student.subjects.map((subject, subjectIndex) => {
                  if (subject.marks > 0) {
                    return (
                      <tr key={subjectIndex}>
                        <td>{subject.name}</td>
                        <td>{subject.marks}</td>
                        <td>{calculateGrade(subject.marks)}</td>
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
const allowedEmailsForHome = ['pratech18@gmail.com'];

function App() {
  const saveStudentDataForPragati = () => {
  saveStudentData('Pragati');  
};
  const [students, setStudents] = useState(Array(20).fill().map(() => ({
    
    name: '',
    subjects: [
      { name: 'English', marks: 0 },
      { name: 'Social', marks: 0 },
      { name: 'Nepali', marks: 0 },
      { name: 'Maths', marks: 0 },
    ],
    totalMarks: 0,
    totalGPA: 0,
    overallGrade: '',
  })));
  const router = useRouter();
  const [showResult, setShowResult] = useState(false);
  const [showData, setShowData] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleNameChange = (index, name) => {
    const updatedStudents = [...students];
    updatedStudents[index].name = name;
    setStudents(updatedStudents);
  };

  const handleMarksChange = (studentIndex, subjectIndex, marks) => {
    const updatedStudents = [...students];
    updatedStudents[studentIndex].subjects[subjectIndex].marks = parseInt(marks);
    setStudents(updatedStudents);
  };

  const calculateMarks = () => {
    const updatedStudents = students.map((student) => {
      const filledFields = student.subjects.filter((subject) => subject.marks > 0);
      if (filledFields.length === 0) {
        return student; 
      }
      const totalMarks = filledFields.reduce((total, subject) => total + subject.marks, 0);
      const averageMarks = totalMarks / filledFields.length;
      const totalGPA = calculateGPA(averageMarks);
      const overallGrade = calculateGrade(averageMarks);

      return {
        ...student,
        totalMarks,
        totalGPA,
        overallGrade,
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
    const schoolName = 'Pragati'; // Use the 'Pragati' school name
    try {
      const studentsCollectionRef = collection(db, "students");
      const querySnapshot = await getDocs(studentsCollectionRef);
      const retrievedStudents = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((student) => student.school === schoolName); // Filter by 'Pragati' school name
      setStudents(retrievedStudents);
      setShowData(true);
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

    return () => unsubscribe();
  }, []);
  return (    <ProtectedPage allowedEmails={allowedEmailsForHome}>

    <div style={{ fontFamily: 'Arial, sans-serif' }} className={styles.body}>    
      {loggedIn && <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>}

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
                  onChange={(e) => handleNameChange(index, e.target.value)
                
                }
                className={styles.inputs}
                />
              </td>
              {student.subjects.map((subject, subjectIndex) => (
                <td key={subjectIndex}>
                  <input
                    type="number"
                    value={subject.marks}
                    onChange={(e) =>
                      handleMarksChange(index, subjectIndex, e.target.value)
                    }
                    min="0"
                    max="100"
                    className={styles.inputs}

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


      <button style={{ marginTop: '10px' }} onClick={showSavedData}>
        Show Data
      </button>
      {showResult && <Result students={students} />}
      {showData && <Result students={students} />}
    </div>
    </ProtectedPage>
  );
}

export default App;