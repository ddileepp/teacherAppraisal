import React, { useState, useEffect } from 'react';
import { User, Mail, Plus, Edit2, Trash } from 'lucide-react';
import { db } from "../../config/firebaseConfig"; // Assuming the Firebase configuration is set here
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  joinDate: string;
}

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [editTeacherId, setEditTeacherId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Departments options
  const departments = [
    'CSE', 'IT', 'MECH', 'AIML', 'CSBS', 'AIDS', 'CIVIL', 'EEE', 'ECE'
  ];

  // Fetch teacher data from Firestore on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'teachers'));
        const teachersList: Teacher[] = [];
        querySnapshot.forEach((doc) => {
          teachersList.push({
            id: doc.id,
            ...doc.data(),
          } as Teacher);
        });
        setTeachers(teachersList);
      } catch (err) {
        console.error("Error fetching teachers: ", err);
        setError('Error fetching teacher data.');
      }
    };
    fetchTeachers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeacher({ ...newTeacher, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewTeacher({ ...newTeacher, department: e.target.value });
  };

  const handleAddTeacher = async () => {
    const { name, email, department } = newTeacher;
    if (!name || !email || !department) {
      setError('Please fill in all fields');
      return;
    }

    const joinDate = new Date().toLocaleDateString(); // Get today's date

    try {
      if (editTeacherId) {
        // Update an existing teacher
        await updateDoc(doc(db, 'teachers', editTeacherId), {
          name,
          email,
          department,
        });

        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) =>
            teacher.id === editTeacherId
              ? { ...teacher, name, email, department }
              : teacher
          )
        );
        setEditTeacherId(null); // Reset edit mode
      } else {
        // Add a new teacher
        const docRef = await addDoc(collection(db, 'teachers'), {
          name,
          email,
          department,
          joinDate,
          password: 'webcap', // Fixed password for login
        });

        setTeachers((prevTeachers) => [
          ...prevTeachers,
          {
            id: docRef.id,
            name,
            email,
            department,
            joinDate,
          },
        ]);
      }

      setNewTeacher({ name: '', email: '', department: '' }); // Reset form
      setShowForm(false); // Hide form after successful submission
    } catch (err) {
      setError('Error saving teacher. Please try again.');
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setNewTeacher({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
    });
    setEditTeacherId(teacher.id);
    setShowForm(true); // Show form in edit mode
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teachers', id));
      setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher.id !== id));
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError('Error deleting teacher. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => {
            setShowForm(true);
            setEditTeacherId(null); // Ensure form is in "add" mode
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Teacher
        </button>
      </div>

      {/* Show form to add/edit teacher */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            {editTeacherId ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={newTeacher.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={newTeacher.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                name="department"
                value={newTeacher.department}
                onChange={handleSelectChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              onClick={handleAddTeacher}
            >
              {editTeacherId ? 'Update Teacher' : 'Add Teacher'}
            </button>
            <button
              className="mt-2 w-full text-gray-600 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <User className="w-12 h-12 text-gray-400 bg-gray-100 rounded-full p-2" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{teacher.name}</h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{teacher.email}</span>
                    </div>
                    <p className="text-gray-600">Department: {teacher.department}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  Joined: {new Date(teacher.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                onClick={() => handleEditTeacher(teacher)}
              >
                <Edit2 className="w-4 h-4 mr-2 inline-block" />
                Edit
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => handleDeleteTeacher(teacher.id)}
              >
                <Trash className="w-4 h-4 mr-2 inline-block" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
