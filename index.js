import express, { json } from 'express';
import { connect } from 'mongoose';
import Student from './db/Studentdb.js';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routers/about.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use('/api/about',router);

// Middleware to parse JSON
app.use(json());
app.use(express.urlencoded({ extended: true })); // This parses form data

// Connect to MongoDB
connect('mongodb://localhost:27017/First', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the user form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Studentcont.html'));
});



// Handle form submission and redirect to the admin page
app.post('/users', (req, res) => {
  const { rollno, name, year} = req.body;

  
  Student.findOne({ roll_no: rollno, name:name})
    .then((existingStudent) => {
      if (existingStudent) {
        
        return res.send('Student with this rollno and na,me already exists')
        
      }

      
      const newStudent = new Student({
        roll_no: rollno,
        name: name,
        year: year,
        
      });

      return newStudent.save();
    })
    .then(() => {
      res.redirect('/admin');
    })
   
});


// Handle deletion of a student
app.post('/delete-student', (req, res) => {
  const { id } = req.body;
  Student.findByIdAndDelete(id).then(() => {
    res.redirect('/admin');
  }).catch(err => {
    console.error('Error deleting student:', err);
    res.status(500).send('Error deleting student');
  });
});

// Serve the admin page directly
app.get('/admin', (req, res) => {
  Student.find({}).exec().then(students => {
    let studentTableRows = students.map(student => `
      <tr>
        <td>${student.roll_no}</td>
        <td>${student.name}</td>
        <td>${student.year}</td>
        <td>
          <form action="/delete-student" method="POST">
            <input type="hidden" name="id" value="${student._id}">
            <button type="submit">Delete</button>
          </form>
        </td>
      </tr>
    `).join('');
    
    res.send(`
      <html>
      <head><title>Admin Panel</title></head>
      <body>
      <center>
        <h1>Admin Panel</h1>
        <table border="1">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${studentTableRows}</tbody>
        </table>
        </center>
      </body>
      </html>
    `);
  }).catch(err => {
    console.error('Error fetching students:', err);
    res.status(500).send('Error fetching students');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
